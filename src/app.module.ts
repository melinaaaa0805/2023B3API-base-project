import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import User from './users/entities/user.entity';
import Project from './projects/entities/project.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategie';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/auth.constant';
import { ProjectUser } from './project-user/entities/project-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Project, ProjectUser],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    ProjectsModule,
    ProjectUser,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
