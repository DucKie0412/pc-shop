import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty({message: "Please enter a email"})
    email: string;

    @IsNotEmpty({message: "Please enter a password"})
    password: string;

    @IsNotEmpty({message: "Please enter your full name"})
    name: string;

    @IsNotEmpty({message: "Please enter your phone number"})
    phone: string;

    @IsOptional()
    avatar: string;

    @IsNotEmpty({message: "Please enter an address"})
    address: string;
}


export class ActiveAuthDto {

    @IsNotEmpty({message: "Please enter an ID"})
    _id: string;

    @IsNotEmpty({message: "Please enter an active code"})
    activeCode: string;

}

export class ReactiveAuthDto{
    @IsNotEmpty({message: "Please enter a email"})
    email: string;
}

export class ChangePasswordDto{
    @IsNotEmpty({message: "Please enter a email"})
    email: string;

    @IsNotEmpty({message: "Please enter a code"})
    codeId: string;

    @IsNotEmpty({message: "Please enter a new password"})
    newPassword: string;

    @IsNotEmpty({message: "Please enter a confirm password"})
    confirmPassword: string;
}