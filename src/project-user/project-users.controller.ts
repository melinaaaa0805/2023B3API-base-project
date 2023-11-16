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
    try {
      // Vérifier les autorisations de l'utilisateur
      if (req.user.role !== 'Admin' && req.user.role !== 'ProjectManager') {
        throw new UnauthorizedException('Accès non autorisé');
      }

      // Vérifier si l'utilisateur est déjà affecté à un projet pour la période demandée
      const existingProjectUser =
        await this.projectUserService.checkIfUserIsAssigned(
          createProjectUserDto.userId,
          createProjectUserDto.startDate,
          createProjectUserDto.endDate,
        );

      if (existingProjectUser) {
        throw new ConflictException(
          "L'utilisateur est déjà assigné à un projet sur les mêmes dates.",
        );
      }

      // Créer le ProjectUser si l'utilisateur n'est pas déjà affecté à un projet sur les mêmes dates
      const projectUser =
        await this.projectUserService.create(createProjectUserDto);

      // Renvoyer le projetUser avec les relations user, project et referringEmployee incluses
      return this.projectUserService.getProjectUserDetails(projectUser.id);
    } catch (error) {
      // Gérer les autres erreurs éventuelles ici
      throw new ConflictException('Erreur lors de la création du ProjectUser');
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
