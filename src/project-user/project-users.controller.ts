import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ConflictException,
  Get,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { ProjectsUsersService } from './project-user.service';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { AuthGuard } from '../auth/auth.gards';
import { ProjectUser } from './entities/project-user.entity';

@Controller('project-users')
export class ProjectUsersController {
  constructor(private readonly projectUserService: ProjectsUsersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async create(@Body() createProjectUserDto: CreateProjectUserDto, @Req() req) {
    console.log('LEE roLE' + req.user.role);
    if (req.user.role == 'Admin' || req.user.role == 'ProjectManager') {
      const projects =
        await this.projectUserService.findByEmployee(createProjectUserDto);
      if (projects == null) {
        const projectUser =
          await this.projectUserService.create(createProjectUserDto);
        return projectUser;
      } else {
        throw new ConflictException(
          "L'utilisateur est déjà assigné à un projet sur les mêmes dates.",
        );
      }
    } else {
      throw new UnauthorizedException('Accès non autorisé');
    }
  }
  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req) {
    if (req.user.role == 'Admin') {
      const projetUser = this.projectUserService.findAll();
      if (projetUser == null) {
        throw new UnauthorizedException();
      }
    } else {
      const projetUser = this.projectUserService.findOne(req.user.sub);
      if (projetUser == null) {
        throw new UnauthorizedException();
      }
    }
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async findprojectUser(@Param('id') projectUserId: string, @Req() req) {
    const projetUser: ProjectUser =
      await this.projectUserService.findOne(projectUserId);
    if (projetUser == null) {
      throw new UnauthorizedException();
    }
    if (req.user.role == 'Admin' || req.user.role == 'ProjectManager') {
      return projetUser;
    } else {
      if (projetUser.userId === req.user.sub) {
        return projetUser;
      }
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
