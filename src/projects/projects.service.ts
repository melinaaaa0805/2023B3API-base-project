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
    const options: FindManyOptions<Project> = {
      where: { referringEmployeeId: id },
      relations: ['user', 'project_user'],
    };
    const project = await this.projectsRepository.findOne(options);
    delete project.referringEmployee.password;
    return { project };
  }

  async findById(id: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: id },
    });
    return project;
  }
}
