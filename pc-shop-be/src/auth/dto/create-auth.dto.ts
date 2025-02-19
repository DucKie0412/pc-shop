import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty({message: "Please enter a email"})
    email: string;

    @IsNotEmpty({message: "Please enter a password"})
    password: string;

    @IsOptional()
    name:string;
}
