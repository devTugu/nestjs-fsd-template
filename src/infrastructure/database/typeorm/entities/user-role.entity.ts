import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity({ name: 'user_roles' })
@Unique(['userId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_user_roles_user_id')
  @Column({ name: 'user_id' })
  userId: number;

  @Index('IDX_user_roles_role_id')
  @Column({ name: 'role_id' })
  roleId: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
