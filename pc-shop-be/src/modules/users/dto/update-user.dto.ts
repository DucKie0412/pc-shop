import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsMongoId({message: 'Not a valid MongoId!'})
    @IsNotEmpty({message: 'Id not be empty!'})
    _id: string;

    @IsOptional()
    name: string;

    @IsOptional()
    password: string;

    @IsOptional()
    phone: string;

    @IsOptional()
    avatar: string;

    @IsOptional()
    address: string;

}
