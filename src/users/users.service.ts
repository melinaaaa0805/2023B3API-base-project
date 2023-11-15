import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto, isUUID } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { loginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, saltOrRounds),
    });
    const insertedUser = await this.usersRepository.save(newUser);
    delete insertedUser.password;
    return insertedUser;
  }

  async signIn(LoginUserDto: loginUserDto) {
    const options: FindOneOptions<User> = {
      where: { email: LoginUserDto.email },
    };
    const user = await this.usersRepository.findOne(options);
    const match = await bcrypt.compare(LoginUserDto.password, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    for (const user of users) {
      delete user.password;
    }
    return users;
  }

  async returnUser(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format for user ID');
    }
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    if (user === null) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    delete user.password;
    return user;
  }
}
