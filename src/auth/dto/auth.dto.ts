import { IsEmail, IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsString()
	@IsEmail()
	email: string

	@IsString()
	@MinLength(6, { message: "Password can't be less than 6 characters!" })
	password: string
}
