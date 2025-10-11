import { IsObject, IsOptional } from 'class-validator';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Stream } from 'stream';

export class ReqData extends FastifyAdapter {
  @IsObject()
  @IsOptional()
  readonly user?: {
    id: number;
    roleId: number;
  };

  @IsOptional()
  readonly body?: unknown;

  @IsOptional()
  readonly multipart?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (field: any, file: Stream, filename: string) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback: (error: Error) => any
  ) => any;
}

export type Multipart = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (field: any, file: Stream, filename: string) => any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorCallback: (error: Error) => any
) => any;
