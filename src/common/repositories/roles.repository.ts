import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Roles } from 'db/entities/roles.entity';

@Injectable()
export class RolesRepository extends Repository<Roles> {
  constructor(private readonly ds: DataSource) {
    super(Roles, ds.createEntityManager());
  }

  getRole(type: string) {
    return this.createQueryBuilder()
      .select('Roles.id')
      .where('name= :name', { name: type })
      .getOne();
  }
}
