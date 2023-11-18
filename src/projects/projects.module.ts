import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Project from './entities/project.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { UsersController } from '../users/users.controller';
import User from '../users/entities/user.entity';
import { ProjectUser } from '../project-user/entities/project-user.entity';
import { ProjectUsersController } from '../project-user/project-users.controller';
import { ProjectsUsersService } from '../project-user/project-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User, ProjectUser]),
    UsersModule,
  ],
  controllers: [ProjectsController, UsersController, ProjectUsersController],
  providers: [ProjectsService, UsersService, ProjectsUsersService], // Add UserRepository to providers
  exports: [ProjectsService, UsersService, ProjectsUsersService],
})
export class ProjectsModule {}
