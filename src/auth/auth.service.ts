import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { hash, genSalt, compare } from 'bcryptjs'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel } from 'src/user/user.model'
import { AuthDto } from './dto/auth.dto'
import { RefreshTokenDto } from './dto/refreshToken.dto'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
		private readonly JwtService: JwtService
	) {}

	async signup(dto: AuthDto) {
		const oldUser = await this.UserModel.findOne({ email: dto.email })
		if (oldUser)
			throw new BadRequestException(
				'User with this email is already in the system!'
			)

		const salt = await genSalt(10)

		const newUser = new this.UserModel({
			email: dto.email,
			password: await hash(dto.password, salt)
		})

		const tokens = await this.issueTokenPair(String(newUser._id))

		return {
			user: await this.returnUserFields(await newUser.save()),
			...tokens
		}
	}

	async signin(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokenPair(String(user._id))

		return {
			user: await this.returnUserFields(user),
			...tokens
		}
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.UserModel.findOne({ email: dto.email })
		if (!user) throw new UnauthorizedException('User not found')

		const isValidPassword = await compare(dto.password, user.password)
		if (!isValidPassword) throw new UnauthorizedException('Invalid password')

		return user
	}

	async issueTokenPair(userId: string) {
		const data = { _id: userId }

		const accessToken = await this.JwtService.signAsync(data, {
			expiresIn: '1h'
		})

		const refreshToken = await this.JwtService.signAsync(data, {
			expiresIn: '15d'
		})

		return { accessToken, refreshToken }
	}

	async returnUserFields({ _id, email, isAdmin, favorites }: UserModel) {
		return { _id, email, isAdmin, favorites }
	}

	async refresh({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please, sign in!')

		const result = await this.JwtService.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid token or expired!')

		const user = await this.UserModel.findById(result._id)
		if (!user) throw new UnauthorizedException('User not found')

		const tokens = await this.issueTokenPair(String(user._id))

		return { user: await this.returnUserFields(user), ...tokens }
	}
}
