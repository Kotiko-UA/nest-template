import { MigrationInterface, QueryRunner } from "typeorm";

export class Roles1768818323771 implements MigrationInterface {
    name = 'Roles1768818323771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "roleId"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roleId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "roleId" TO "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ace513fa30d485cfd25c11a9e4a" FOREIGN KEY ("role") REFERENCES "Roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
