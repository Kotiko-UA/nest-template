// r2-storage.service.ts
import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from './r2.client';
import { randomUUID } from 'crypto';
import { lookup as mimeLookup, extension as mimeExt } from 'mime-types';
import { ConfigService } from '@nestjs/config';

export type MulterFile = any;

@Injectable()
export class R2StorageService {
  private readonly bucket: string;
  private readonly publicBase: string;
  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get('r2.r2Bucket');
    this.publicBase = this.configService
      .get('r2.r2PublicBaseUrl')
      .replace(/\/+$/, '');
  }

  private buildKey(file: MulterFile, prefix?: string) {
    const safePrefix = prefix ? prefix.replace(/^\/+|\/+$/g, '') + '/' : '';
    const date = new Date().toISOString().slice(0, 10);
    const id = randomUUID();
    const extFromMime = file.mimetype ? mimeExt(file.mimetype) : null;
    let ext = (file.originalname.split('.').pop() || '').toLowerCase();
    if (!ext && extFromMime) ext = extFromMime;
    return `${safePrefix}${date}/${id}${ext ? '.' + ext : ''}`;
  }

  private publicUrl(key: string) {
    return this.publicBase ? `${this.publicBase}/${encodeURI(key)}` : null;
  }

  async uploadMany(
    files: MulterFile[],
    options?: { prefix?: string; makePublicUrl?: boolean },
  ) {
    if (!files?.length) return [];

    const results = [];
    for (const f of files) {
      const key = this.buildKey(f, options?.prefix);
      const contentType =
        f.mimetype || mimeLookup(f.originalname) || 'application/octet-stream';

      await r2Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: f.buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
          ContentDisposition: 'inline',
        }),
      );

      results.push({
        key,
        url: options?.makePublicUrl ? this.publicUrl(key) : null,
        filename: f.originalname,
        contentType,
        size: f.size,
      });
    }
    return results;
  }
}
