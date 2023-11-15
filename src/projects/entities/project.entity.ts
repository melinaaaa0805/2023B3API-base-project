import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProjectUser } from '../../project-user/entities/project-user.entity';
import User from '../../users/entities/user.entity';

//Creation database

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  referringEmployeeId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'referringEmployeeId' })
  referringEmployee: User;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.projectId)
  projectUsers: ProjectUser[];
}

export default Project;
