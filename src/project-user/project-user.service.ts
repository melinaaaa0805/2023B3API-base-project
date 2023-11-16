import { ConflictException, Injectable } from '@nestjs/common';
import {
  Between,
  FindOneOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
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

  async create(
    createProjectUserDto: CreateProjectUserDto,
  ): Promise<ProjectUser> {
    try {
      // Créer une instance de l'entité ProjectUser avec les données du DTO
      const newProjectUser =
        this.projectsUsersRepository.create(createProjectUserDto);

      // Enregistrer le nouveau ProjectUser dans la base de données
      const savedProjectUser =
        await this.projectsUsersRepository.save(newProjectUser);

      return savedProjectUser;
    } catch (error) {
      // Gérer les erreurs éventuelles lors de la création du ProjectUser
      throw new ConflictException('Erreur lors de la création du ProjectUser');
    }
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
  async isUserInvolvedInProject(
    idUser: string,
    idProject: string,
  ): Promise<boolean> {
    const project = await this.projectsUsersRepository.findOne({
      where: { userId: idUser, projectId: idProject },
    });
    if (project === undefined) {
      return false;
    }
    return true;
  }
  async checkIfUserIsAssigned(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProjectUser | null> {
    // Vérifie si l'utilisateur est déjà affecté à un projet pour la période demandée
    const existingProjectUser = await this.projectsUsersRepository.findOne({
      where: {
        userId,
        startDate: Between(startDate, endDate),
        endDate: Between(startDate, endDate),
      },
    });

    return existingProjectUser || null;
  }

  async getProjectUserDetails(projectUserId: string): Promise<ProjectUser> {
    // Récupérer les détails du ProjectUser avec les relations incluses
    const options: FindOneOptions<ProjectUser> = {
      where: { id: projectUserId },
      relations: ['user', 'project'],
    };

    const info = await this.projectsUsersRepository.findOneOrFail(options);
    delete info.user.password;
    return info;
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
