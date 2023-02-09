import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Put,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { IdValidationPipe } from 'src/pipes/id-validation.pipe'
import { User } from './decorators/user.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@Auth('admin')
	async getAllUsers(@Query() searchTerm?: string) {
		return await this.userService.getAll(searchTerm)
	}

	@Get('/count')
	@Auth('admin')
	async getCountUser() {
		return await this.userService.getCount()
	}

	@Get('/profile')
	@Auth()
	async getProfile(@User('_id') _id: string) {
		return await this.userService.getById(_id)
	}

	@Get(':id')
	@Auth('admin')
	async getUser(@Param('id', IdValidationPipe) id: string) {
		return await this.userService.getById(id)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put('/profile')
	@Auth()
	async updateProfile(@User('_id') _id: string, @Body() dto: UpdateUserDto) {
		return await this.userService.updateProfile(_id, dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth('admin')
	async updateUser(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: UpdateUserDto
	) {
		return await this.userService.updateProfile(id, dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Delete(':id')
	@Auth('admin')
	async deleteUser(@Param('id', IdValidationPipe) id: string) {
		return await this.userService.deleteUser(id)
	}
}
