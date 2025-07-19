import mongoose, { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordUtil } from 'src/utils/util';
import aqp from 'api-query-params';
import { ActiveAuthDto, ChangePasswordDto, CreateAuthDto, ReactiveAuthDto } from 'src/auth/dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private mailerService: MailerService,
  ) { }

  isEmailExist = async (email: string) => {
    const isExist = await this.userModel.exists({ email });
    if (isExist) {
      return true;
    }
    return false;
  }

  async create(createUserDto: CreateUserDto) {

    //check email is exist
    const isEmailExist = await this.isEmailExist(createUserDto.email);
    if (isEmailExist) {
      throw new BadRequestException(`Email: ${createUserDto.email} is exist`);
    }

    //hash password
    const hashedPassword = await hashPasswordUtil(createUserDto.password);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword
    })
    return user._id;
  }

  //pagination
  async findAll( query: any) {

    return await this.userModel.find().select('-password');

  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async getUserPoints(id: string) {
    const user = await this.userModel.findById(id).select('points');
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    return { points: user.points };
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async findByPhone(phone: string) {
    return await this.userModel.findOne({ phone })
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: updateUserDto._id }, { ...updateUserDto });
  }

  remove(_id: string) {
    //check mongoId is valid
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id })
    }
    else {
      throw new BadRequestException(`Id: ${_id} is not exist in the database`);
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { email, password, name, phone, address } = registerDto;

    //check email exist
    const isEmailExist = await this.isEmailExist(email);
    if (isEmailExist) {
      throw new BadRequestException(`Email: ${email} is already exist`);
    }

    //hash password
    const hashPassword = await hashPasswordUtil(password);
    const generateCodeId = () => Math.floor(100000 + Math.random() * 900000).toString();
    const createdUser = await this.userModel.create(
      {
        name,
        email,
        password: hashPassword,
        phone,
        address,
        isActive: false,
        codeId: generateCodeId(),
        codeExpired: new Date((new Date().getTime() + 1000 * 60 * 15)) // expire in 15'
      });

    //send verification email
    await this.mailerService.sendMail({
      to: createdUser.email, // list of receivers
      subject: 'Active your account at Duckie Shop', // Subject line
      template: "sending-activation-code",
      context: {
        name: createdUser?.name ?? createdUser.email, //return name if exists or email if not
        activationCode: createdUser?.codeId ?? "123456"
      }
    })

    return {
      _id: createdUser._id,
    }
  }

  async handleSendCodeId(email: string) {
    const user = await this.userModel.findOne({ email: email });

    //check if the user is existing
    if (!user) {
      throw new BadRequestException('User not found!');
    }

    // check if the code has expired
    if (user?.codeExpired && new Date(user?.codeExpired) < new Date()) {
      //renew date
      const generateCodeId = () => Math.floor(100000 + Math.random() * 900000).toString();

      //send verification email
      await this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: 'Change your password account at Duckie Shop', // Subject line
        template: "sending-change-password-code",
        context: {
          name: user?.name ?? user.email, //return name if exists or email if not
          activationCode: generateCodeId ?? "123456"
        }
      })

      await this.userModel.updateOne(
        { email },
        {
          codeId: generateCodeId(),
          codeExpired: new Date((new Date().getTime() + 1000 * 60 * 5))
        });
    }
    else {
      //send verification email
      await this.mailerService.sendMail({
        to: user?.email, // list of receivers
        subject: 'Change your password account at Duckie Shop', // Subject line
        template: "sending-change-password-code",
        context: {
          name: user?.name ?? user?.email, //return name if exists or email if not
          activationCode: user?.codeId ?? "123456"
        }
      })
    }
  }

  async handleActive(activeDto: ActiveAuthDto) {
    const { _id, activeCode } = activeDto;

    const user = await this.userModel.findOne({ _id });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    // So sánh codeId từ database với activeCode từ request
    if (user.codeId !== activeCode) {
      throw new BadRequestException('Invalid activation code!');
    }

    // Kiểm tra code đã hết hạn chưa
    if (user.codeExpired && new Date(user.codeExpired) < new Date()) {
      throw new BadRequestException('Activation code has expired!');
    }

    // Cập nhật trạng thái isActive
    await this.userModel.updateOne({ _id }, { isActive: true });

    return { message: "Account activated successfully!" };
  }

  async handleReactive(email: string) {
    const user = await this.userModel.findOne({ email: email });

    //check if the user has actived
    if (user?.isActive) {
      throw new BadRequestException('Account is already active!');
    }

    // check if the code has expired
    if (user?.codeExpired && new Date(user?.codeExpired) < new Date()) {
      //renew date
      const generateCodeId = () => Math.floor(100000 + Math.random() * 900000).toString();

      //send verification email
      await this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: 'Active your account at Duckie Shop', // Subject line
        template: "sending-activation-code",
        context: {
          name: user?.name ?? user.email, //return name if exists or email if not
          activationCode: generateCodeId ?? "123456"
        }
      })

      await this.userModel.updateOne(
        { email },
        {
          codeId: generateCodeId(),
          codeExpired: new Date((new Date().getTime() + 1000 * 60 * 5))
        });
    }
    else {
      //send verification email
      await this.mailerService.sendMail({
        to: user?.email, // list of receivers
        subject: 'Active your account at Duckie Shop', // Subject line
        template: "sending-activation-code",
        context: {
          name: user?.name ?? user?.email, //return name if exists or email if not
          activationCode: user?.codeId ?? "123456"
        }
      })
    }
    return { message: "Resend active code successfully!", email: email, _id: user?._id };
  }

  async handleChangePassword(changePasswordDto: ChangePasswordDto) {
    const { email, codeId, newPassword, confirmPassword } = changePasswordDto;
    const user = await this.userModel.findOne({ email: email });

    //check if the user is existing
    if (!user) {
      throw new BadRequestException('User not found!');
    }

    // So sánh codeId từ database với activeCode từ request
    if (user.codeId !== codeId) {
      throw new BadRequestException('Invalid change password code or wrong code!');
    }

    //update new password
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Confirm password does not match!');
    }

    const hashPassword = await hashPasswordUtil(newPassword);
    await this.userModel.updateOne({ email }, { password: hashPassword });

    return { message: "Change password successfully!", user: user };
  }

  async toggleUserRole(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const newRole = user.role === 'USER' ? 'STAFF' : 'USER';
    await this.userModel.updateOne({ _id: userId }, { role: newRole });

    return { 
      message: `User role updated successfully!`, 
      newRole: newRole,
      previousRole: user.role 
    };
  }

}
