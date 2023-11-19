import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectUser } from './entities/project-user.entity';
import { JwtService } from '@nestjs/jwt';
import Project from '../projects/entities/project.entity';

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
      if (savedProjectUser == null) {
        throw new ConflictException("Le user ou le projet n'a pas été trouvé");
      }
      const options: FindManyOptions<ProjectUser> = {
        where: { id: savedProjectUser.id },
        relations: ['user', 'project', 'project.referringEmployee'],
      };
      const completeProjectUser =
        await this.projectsUsersRepository.findOne(options);
      delete completeProjectUser.project.referringEmployee.password;
      delete completeProjectUser.user.password;
      return completeProjectUser;
    } catch (error) {
      // Gérer les erreurs éventuelles lors de la création du ProjectUser
      throw new NotFoundException("Le user ou le projet n'a pas été trouvé");
    }
  }
  async findByEmployee(createProjectUserDto: CreateProjectUserDto) {
    const options: FindManyOptions<ProjectUser> = {
      where: {
        userId: createProjectUserDto.userId,
      },
    };
    const finds = await this.projectsUsersRepository.find(options);
    for (const find of finds) {
      if (
        (find.startDate <= createProjectUserDto.startDate &&
          find.endDate >= createProjectUserDto.startDate) ||
        (createProjectUserDto.startDate <= find.startDate &&
          createProjectUserDto.endDate >= find.startDate)
      ) {
        return find;
      }
    }
    return null;
  }
  async findAll(): Promise<Project[]> {
    const options: FindManyOptions<ProjectUser> = {
      relations: ['user', 'project'],
    };
    const projectUser = await this.projectsUsersRepository.find(options);
    const projects = projectUser.map((projectUser) => projectUser.project);
    return projects;
  }
  async findOneProject(id: string): Promise<Project[]> {
    const options: FindManyOptions<ProjectUser> = {
      where: { id: id },
      relations: ['user', 'project'],
    };
    const projectUser = await this.projectsUsersRepository.find(options);
    const projects = projectUser.map((projectUser) => projectUser.project);
    return projects;
  }
  async findOne(id: string): Promise<ProjectUser> {
    const options: FindManyOptions<ProjectUser> = {
      where: { id: id },
    };
    const usersProject = await this.projectsUsersRepository.findOne(options);
    return usersProject;
  }
  // fonction testée

  async isUserInvolvedInProject(
    idUser: string,
    idProject: string,
  ): Promise<boolean> {
    const options: FindManyOptions<ProjectUser> = {
      where: { userId: idUser, projectId: idProject },
    };
    const projects = await this.projectsUsersRepository.findOne(options);
    if (projects == null) {
      return false;
    }
    return true;
  }
  // fonction testée
  async getProjectsForUser(userId: string) {
    const options: FindOneOptions<CreateProjectUserDto> = {
      where: { userId: userId },
      relations: ['user', 'project'],
    };
    const projectUser = await this.projectsUsersRepository.find(options);
    const response = projectUser.map((projectUser) => ({
      id: projectUser.project.id,
      name: projectUser.project.name,
      referringEmployeeId: projectUser.project.referringEmployeeId,
      referringEmployee: {
        id: projectUser.user.id,
        username: projectUser.user.username,
        email: projectUser.user.email,
        role: projectUser.user.role,
      },
    }));
    return response;
  }

  async managerDate(userId: string, date: Date) {
    console.log("l'id user est" + userId + 'la date est ' + date);
    const options2: FindManyOptions<ProjectUser> = {
      where: {
        startDate: LessThanOrEqual(date),
        endDate: MoreThanOrEqual(date),
        project: {
          referringEmployeeId: userId,
        },
      },
      relations: ['project'],
    };
    const isOk = await this.projectsUsersRepository.findOne(options2);
    console.log('Résultat de la requête findOne :', isOk);
    return isOk;
  }
}
