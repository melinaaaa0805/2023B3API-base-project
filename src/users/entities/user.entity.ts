import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEmail, IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';

//Creation database

export enum UserRole {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide" })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: UserRole.Employee })
  @IsOptional()
  role: UserRole;
}

export default User;
