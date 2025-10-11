import { Users } from 'db/entities';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository extends Repository<Users> {
  constructor(private readonly ds: DataSource) {
    super(Users, ds.createEntityManager());
  }

  getUserById(id: number): Promise<Users> {
    return this.findOne({
      where: {
        id,
      },
    });
  }

  getUser(email: string): Promise<Users> {
    return this.findOne({
      where: {
        email,
      },
    });
  }

  getUserInfo(id: number): Promise<Users> {
    return this.createQueryBuilder('user')
      .select(['user.email', 'user.name'])
      .where({ id })
      .getOne();
  }

  getUserWithRole(email: string): Promise<Users> {
    return this.createQueryBuilder()
      .innerJoin('Users.role', 'Roles')
      .select([
        'Users.id',
        'Users.name',
        'Users.email',
        'Users.blocked',
        'Users.active',
        'Roles.id',
      ])
      .where('email= :email', { email })
      .getOne();
  }
}
