import { Injectable } from '@nestjs/common';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectUser } from './entities/project-user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProjectsUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private projectsUsersRepository: Repository<ProjectUser>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createProjectUserDto: CreateProjectUserDto) {
    const newProject =
      this.projectsUsersRepository.create(createProjectUserDto);
    const insertedProject = await this.projectsUsersRepository.save(newProject);
    return { insertedProject };
  }
  async findByEmployee(createProjectUserDto: CreateProjectUserDto) {
    return await this.projectsUsersRepository.findOne({
      where: {
        userId: createProjectUserDto.userId,
        startDate: LessThanOrEqual(createProjectUserDto.endDate),
        endDate: MoreThanOrEqual(createProjectUserDto.startDate),
        projectId: createProjectUserDto.projectId,
      },
    });
  }
  async findAll(): Promise<ProjectUser[]> {
    const projectUser = await this.projectsUsersRepository.find();
    return projectUser;
  }
  async findOne(id: string): Promise<ProjectUser> {
    const projectUser = await this.projectsUsersRepository.findOne({
      where: { id: id },
    });
    return projectUser;
  }
}

/*async signIn(LoginUserDto: loginUserDto) {
    const options: FindOneOptions<User> = {
      where: { email: LoginUserDto.email },
    };
    const user = await this.usersRepository.findOne(options);
    const match = await bcrypt.compare(LoginUserDto.password, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email };
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
  }*/
