import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';

interface MulterOptions {
  maxFiles?: number;
  maxFileSize?: number; // в байтах
  allowedTypes?: string[]; // масив MIME типів
  useMemoryStorage?: boolean;
}

export function FileUploadInterceptor(
  fieldName: string,
  options: MulterOptions = {},
) {
  const {
    maxFiles = 5,
    maxFileSize = 2 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    useMemoryStorage = false,
  } = options;

  return FilesInterceptor(fieldName, maxFiles, {
    storage: useMemoryStorage
      ? memoryStorage()
      : diskStorage({
          destination: './static',
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, filename);
          },
        }),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(
            `Invalid file type! Allowed: ${allowedTypes.join(', ')}`,
          ),
          false,
        );
      }
    },
  });
}
