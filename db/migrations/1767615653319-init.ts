import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1767615653319 implements MigrationInterface {
    name = 'Init1767615653319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_8eadedb8470c92966389ecc2165" UNIQUE ("name"), CONSTRAINT "PK_efba48c6a0c7a9b6260f771b165" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying NOT NULL DEFAULT '', "avatar" character varying NOT NULL DEFAULT '', "blocked" boolean NOT NULL DEFAULT false, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "loginLockedUntil" TIMESTAMP, "loginLockoutCount" integer NOT NULL DEFAULT '0', "lastFailedLoginAt" TIMESTAMP, "token" character varying DEFAULT '', "refreshToken" character varying, "verificationCode" character varying, "active" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "role" integer, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ace513fa30d485cfd25c11a9e4a" FOREIGN KEY ("role") REFERENCES "Roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "Roles"`);
    }

}
