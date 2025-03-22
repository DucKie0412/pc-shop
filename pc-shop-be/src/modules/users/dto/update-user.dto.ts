
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsMongoId({message: 'Not a valid MongoId!'})
    @IsNotEmpty({message: 'Id not be empty!'})
    _id: string;

    @IsOptional()
    email: string;

    @IsOptional()
    name: string;

    @IsOptional()
    phone: string;

    @IsOptional()
    address: string;

}
