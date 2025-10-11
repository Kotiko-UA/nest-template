import { diskStorage } from 'fastify-multer';
import { extname } from 'path';
const randomstring = require('randomstring');

export const storageConfig = {
  storage: diskStorage({
    destination: 'static',
    filename: (req, file, cb) => {
      const randomName = randomstring.generate(43);
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoMimeTypes = ['video/mp4', 'video/mpeg'];

    if (
      allowedImageMimeTypes.includes(file.mimetype) ||
      allowedVideoMimeTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only images and videos are allowed.'),
        false
      );
    }
  },
};
