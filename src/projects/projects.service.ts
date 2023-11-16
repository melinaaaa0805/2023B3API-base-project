import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { JwtService } from '@nestjs/jwt';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const newProject = this.projectsRepository.create(createProjectDto);
    const insertedProject = await this.projectsRepository.save(newProject);
    return { insertedProject };
  }
  async getProject(name: string) {
    const project: UpdateProjectDto = await this.projectsRepository.findOne({
      where: { name: name },
    });
    return { project };
  }

  async findAll() {
    const options: FindManyOptions<Project> = {
      relations: ['referringEmployee'],
    };
    const projects = await this.projectsRepository.find(options);

    const sanitizedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      referringEmployeeId: project.referringEmployeeId,
      referringEmployee: {
        id: project.referringEmployee.id,
        username: project.referringEmployee.username,
        email: project.referringEmployee.email,
        role: project.referringEmployee.role,
      },
    }));
    return sanitizedProjects;
  }

  async findByEmployee(id: string) {
    const project = await this.projectsRepository.find({
      where: { referringEmployeeId: id },
    });
    return { project };
  }
  async findById(id: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: id },
    });
    return project;
  }
  async findOneByEmployee(id: string) {
    const project = await this.projectsRepository.find({
      where: { referringEmployeeId: id },
    });
    return { project };
  }
  async getProjectsForUser(id: string) {
    const projects = await this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project.projectUsers', 'projectId')
      .innerJoin('projectUser.user', 'referringEmployeeId')
      .where('user.id = :userId', { id })
      .getMany();
    return projects;
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
