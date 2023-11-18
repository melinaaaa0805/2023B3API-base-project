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
import { loginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Repository for user entities
    private readonly jwtService: JwtService, // JWT service for token generation
  ) {}

  // Function to create a new user
  // Hashes the user's password before saving it to the database
  async create(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, saltOrRounds),
    });
    const insertedUser = await this.userRepository.save(newUser);
    delete insertedUser.password; // Do not return the password in the response
    return insertedUser;
  }

  // Function to authenticate a user and generate a JWT token
  async signIn(loginUserDto: loginUserDto) {
    // Find the user based on their email
    const options: FindOneOptions<User> = {
      where: { email: loginUserDto.email },
    };
    const user = await this.userRepository.findOne(options);

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(loginUserDto.password, user.password);

    if (!match) {
      throw new UnauthorizedException(); // Throw an exception if passwords do not match
    }

    // Generate a JWT token with user information
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Function to retrieve all users
  // Removes the password from each user object in the response
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    for (const user of users) {
      delete user.password; // Do not return passwords in the response
    }
    return users;
  }

  // Function to retrieve a specific user by ID
  // Throws exceptions for invalid UUID format and when the user is not found
  async returnUser(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format for user ID');
    }

    // Find the user by ID
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    // Throw an exception if the user is not found
    if (user === null) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    delete user.password; // Do not return the password in the response
    return user;
  }
}
