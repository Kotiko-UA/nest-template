import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ErrorCodes,
  ErrorDescriptionsArray,
} from 'src/common/statusCodes/errors';

export class AppException extends HttpException {
  constructor(code: ErrorCodes, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    const message = ErrorDescriptionsArray[code] ?? 'Unknown Error';
    super({ code, message }, status);
  }
}
