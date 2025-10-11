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

  @Column({ nullable: false, default: 0 })
  block_count: number;

  @Column({ default: '', nullable: true })
  token: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: false, default: false })
  active: boolean;

  @ManyToOne(() => Roles, role => role.id)
  @JoinColumn({ name: 'role' })
  role: Roles;

  @CreateDateColumn({ type: 'timestamp', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
