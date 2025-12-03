import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';

interface MulterOptions {
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[]; // ✅ додали
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
    allowedExtensions, // ✅
    useMemoryStorage = false,
  } = options;

  const allowedExtSet = allowedExtensions
    ? new Set(allowedExtensions.map(e => e.replace(/^\./, '').toLowerCase()))
    : null;

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
      const ext = path
        .extname(file.originalname || '')
        .slice(1)
        .toLowerCase();

      // 1) Перевірка розширення (якщо whitelist заданий)
      if (allowedExtSet) {
        if (!ext || !allowedExtSet.has(ext)) {
          return cb(
            new BadRequestException(
              `Invalid file extension ".${ext || '?'}"! Allowed: ${[...allowedExtSet].join(', ')}`,
            ),
            false,
          );
        }
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            `Invalid file type "${file.mimetype}"! Allowed: ${allowedTypes.join(', ')}`,
          ),
          false,
        );
      }

      return cb(null, true);
    },
  });
}
