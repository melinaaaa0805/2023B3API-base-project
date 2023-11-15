import { Module } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { ProjectsUsersService } from './project-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectUsersController } from './project-users.controller';
import { UsersService } from '../users/users.service';
import { UsersController } from '../users/users.controller';
import { UsersModule } from '../users/users.module';
import User from '../users/entities/user.entity';
import { ProjectUser } from './entities/project-user.entity';
import Project from '../projects/entities/project.entity';
import { ProjectsController } from '../projects/projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User, ProjectUser]),
    UsersModule,
  ],
  controllers: [ProjectUsersController, UsersController, ProjectsController],
  providers: [ProjectsUsersService, UsersService, ProjectsService], // Add UserRepository to providers
  exports: [ProjectsUsersService, ProjectsService, ProjectsService],
})
export class ProjectsModule {}
