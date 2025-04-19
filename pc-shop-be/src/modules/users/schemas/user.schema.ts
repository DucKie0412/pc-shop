import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})  //add cretedAt and updatedAt fields
export class User {
    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    address: string;

    @Prop()
    phone: string;

    @Prop({default: "LOCAL"})
    accountType: string;

    @Prop({default: "USER"})
    role: string;

    @Prop({default: false})
    isActive: boolean;

    @Prop()
    codeId: string;

    @Prop()
    codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
