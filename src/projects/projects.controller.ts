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

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectsService,
    private readonly userService: UsersService,
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
  asyncgetProjects(@Req() req) {
    console.log('LE ROLE EST' + req.user.role);
    if (req.user.role == 'Admin' || req.user.role == 'ProjectManager') {
      return this.projectService.findAll();
    }
    if (req.user.role == 'Employee') {
      const id: string = req.user.sub;
      return this.projectService.findByEmployee(id);
    }
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOneProject(@Param('id') projectId: string, @Req() req) {
    const oneProjet = await this.projectService.findById(projectId);
    if (oneProjet == null) {
      throw new NotFoundException('Resource not found');
    }
    if (req.user.role == 'Admin' || req.user.role == 'ProjectManager') {
      return oneProjet;
    } else {
      throw new ForbiddenException('Access Forbidden');
    }
    if (req)
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
