import { IsNotEmpty, IsOptional, IsString, IsUrl, Validate, ValidateIf, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
export class IsPasswordMatchingConstraint implements ValidatorConstraintInterface {
  validate(passwordConfirmation: string, args: ValidationArguments) {
    const obj = args.object as UpdateUserDto;
    if (!obj.password || !passwordConfirmation) return true;
    return obj.password === passwordConfirmation;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Mật khẩu nhập lại không khớp với mật khẩu bạn đặt';
  }
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @ValidateIf((o) => o.password !== undefined)
  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống'})
  @Validate(IsPasswordMatchingConstraint)
  passwordConfirmation?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}
