import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
  BadRequestException,
} from '@nestjs/common';
import FastifyMulter from 'fastify-multer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Multer } from 'multer';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface FileValidationOptions {
  maxFilesPerField?: number;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  storage?: 'memory' | 'disk';
  destination?: string;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

export function FastifyUniversalFileInterceptor(
  fieldNames: string[],
  options: FileValidationOptions = {},
): Type<NestInterceptor> {
  const {
    maxFilesPerField = 10,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    storage = 'memory',
    destination = './uploads',
  } = options;

  class MixinInterceptor implements NestInterceptor {
    private multer: Multer;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      multerOptions?: Multer,
    ) {
      const multerStorage =
        storage === 'memory'
          ? FastifyMulter.memoryStorage()
          : FastifyMulter.diskStorage({
              destination: async (_req, file, cb) => {
                try {
                  const dir = path.join(destination, file.fieldname);
                  await fs.mkdir(dir, { recursive: true });
                  cb(null, dir);
                } catch (err) {
                  cb(err as Error, '');
                }
              },
              filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname);
                cb(null, `${uuidv4()}${ext}`);
              },
            });

      this.multer = FastifyMulter({
        ...multerOptions,
        storage: multerStorage,
      });
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest<
        Request & { files?: Record<string, MulterFile[]>; filesData?: any }
      >();

      await new Promise<void>((resolve, reject) => {
        this.multer.fields(
          fieldNames.map(name => ({ name, maxCount: maxFilesPerField })),
        )(req, ctx.getResponse(), (err: any) => {
          if (err) return reject(err);

          try {
            const filesData: Record<string, any> = {};

            for (const fieldName of fieldNames) {
              const files = req.files?.[fieldName];
              if (!files || files.length === 0) continue;

              filesData[fieldName] = files.map(file => {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                  throw new BadRequestException(
                    `File type ${file.mimetype} not allowed for field ${fieldName}`,
                  );
                }
                if (file.size > maxFileSize) {
                  throw new BadRequestException(
                    `File size ${file.size} exceeds limit for field ${fieldName}`,
                  );
                }

                return storage === 'memory'
                  ? {
                      originalname: file.originalname,
                      mimetype: file.mimetype,
                      buffer: file.buffer,
                      size: file.size,
                    }
                  : file.path;
              });

              if (filesData[fieldName].length === 1) {
                filesData[fieldName] = filesData[fieldName][0];
              }
            }

            req.filesData = filesData;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
