import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Users } from './users.entity';

@Entity({
  name: 'Roles',
})
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @OneToMany(() => Users, users => users.role)
  users: Users[];
}
