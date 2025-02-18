import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    
    @IsEmail({}, {message: "Not a valid email"} )
    email: string;

    @IsNotEmpty({message: "Password is required"})
    password: string;

    @IsNotEmpty({message: "Name is required"})
    name: string;

    @IsNotEmpty({message: "Address is required"})
    address: string;

    @IsNotEmpty({message: "Phone is required"})
    phone: string;

    
    avatar: string;
    accountType: string;
    role: string;
    isActive: boolean;
}
