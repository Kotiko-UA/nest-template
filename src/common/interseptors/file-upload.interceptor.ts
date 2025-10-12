import { Injectable, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';

interface MulterOptions {
  maxFiles?: number;
  maxFileSize?: number; // в байтах
  allowedTypes?: RegExp;
  useMemoryStorage?: boolean;
}

export function FileUploadInterceptor(
  fieldName: string,
  options: MulterOptions = {},
) {
  const {
    maxFiles = 5,
    maxFileSize = 2 * 1024 * 1024, // 2 МБ
    allowedTypes = /jpeg|jpg|png|pdf/,
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
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
      );
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Невірний тип файлу!'), false);
      }
    },
  });
}
