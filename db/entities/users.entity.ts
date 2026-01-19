import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Roles } from './roles.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: '' })
  phone: string;

  @Column({ nullable: false, default: '' })
  avatar: string;

  @Column({ nullable: false, default: false })
  blocked: boolean;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  loginLockedUntil: Date | null;

  @Column({ type: 'int', default: 0 })
  loginLockoutCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedLoginAt: Date | null;

  @Column({ default: '', nullable: true })
  token: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: false, default: false })
  active: boolean;

  @Column({ type: 'int', nullable: false })
  roleId: number;

  @ManyToOne(() => Roles, role => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'roleId' })
  role: Roles;

  @CreateDateColumn({ type: 'timestamp', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
