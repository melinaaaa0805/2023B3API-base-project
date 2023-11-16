import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Req,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from '../auth/auth.gards';
import { UsersService } from '../users/users.service';
import { ProjectsUsersService } from '../project-user/project-user.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectsService,
    private readonly userService: UsersService,
    private readonly projectUserService: ProjectsUsersService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    if (req.user.role == 'Admin') {
      const user = await this.userService.returnUser(
        createProjectDto.referringEmployeeId,
      );
      if (user.role == 'Admin' || user.role == 'ProjectManager') {
        const project = await this.projectService.create(createProjectDto);
        if (project) {
          const projectGet = await this.projectService.getProject(
            createProjectDto.name,
          );
          if (projectGet !== null) {
            return {
              id: projectGet.project.id,
              name: createProjectDto.name,
              referringEmployeeId: createProjectDto.referringEmployeeId,
              referringEmployee: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
              },
            };
          }
        }
      } else {
        throw new UnauthorizedException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async getProjects(@Req() req) {
    try {
      // Vérifier le rôle de l'utilisateur et filtrer les projets en conséquence
      if (req.user.role === 'Admin' || req.user.role === 'ProjectManager') {
        // Administrateurs ou chefs de projet peuvent voir tous les projets
        return await this.projectService.findAll();
      } else if (req.user.role === 'Employee') {
        // Employé : filtrer les projets dans lesquels l'employé est impliqué
        const employeeProjects = await this.projectService.getProjectsForUser(
          req.user.role,
        );

        console.log(
          'le projet est ou cette fjjd resposee' +
            JSON.stringify(employeeProjects),
        );
        return { employeeProjects };
      } else {
        throw new ForbiddenException('Access Forbidden');
      }
    } catch {
      throw new NotFoundException('Resource not found');
    }
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOneProject(@Param('id') projectId: string, @Req() req) {
    try {
      const oneProject = await this.projectService.findById(projectId);
      // Vérifier si l'utilisateur a le droit de consulter le projet
      if (oneProject == undefined) {
        throw new NotFoundException('Resource not found');
      }
      if (
        req.user.role === 'Admin' ||
        req.user.role === 'ProjectManager' ||
        (req.user.role === 'Employee' &&
          (await this.projectUserService.isUserInvolvedInProject(
            req.user.id,
            oneProject.id,
          )))
      ) {
        return oneProject;
      } else {
        throw new ForbiddenException('Access Forbidden');
      }
    } catch {
      throw new NotFoundException('Resource not found');
    }
  }
}

/* @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.projectService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  getUserById(@Param('id') projectId: string) {
    const project = this.projectService.returnUser(projectId);
    return project;
  }*/
