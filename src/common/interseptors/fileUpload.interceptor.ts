import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
} from '@nestjs/common';
import FastifyMulter from 'fastify-multer';
import * as fs from 'fs';
import { Multer } from 'multer';
import * as path from 'path';
import { Observable } from 'rxjs';
import { IFile } from 'src/shared/types';
import { v4 as uuidv4 } from 'uuid';

export function FastifyFileInterceptor(
  fieldNames: string[]
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: any;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer
    ) {
      this.multer = (FastifyMulter as any)({ ...options });
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
      const userId = request.user ? request.user.id : null;

      await new Promise<void>((resolve, reject) => {
        this.multer.fields(
          fieldNames.map(name => ({
            name,
            maxCount: 1,
          }))
        )(request, ctx.getResponse(), async (error: any) => {
          if (error) {
            return reject(error);
          }

          try {
            const filesData: IFile = {};

            for (const fieldName of fieldNames) {
              const files = request.files[fieldName];
              if (Array.isArray(files) && files.length > 0) {
                const directory =
                  './shared' + '/' + fieldName + '/' + userId + '/';
                fs.mkdirSync(directory, { recursive: true });

                for (const file of files) {
                  const ext = path.extname(file.originalname);
                  const filename = `${uuidv4()}${ext}`;
                  const filePath = path.join(directory, filename);
                  fs.writeFileSync(filePath, file.buffer);

                  filesData[fieldName] = filePath;
                }
              }
            }
            request.filesData = filesData;

            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
