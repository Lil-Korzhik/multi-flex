import {
	Controller,
	Post,
	Body,
	UsePipes,
	ValidationPipe,
	HttpCode
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { RefreshTokenDto } from './dto/refreshToken.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('signup')
	async signup(@Body() dto: AuthDto) {
		return this.authService.signup(dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('signin')
	async signin(@Body() dto: AuthDto) {
		return this.authService.signin(dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('refresh')
	async refresh(@Body() dto: RefreshTokenDto) {
		return this.authService.refresh(dto)
	}
}
