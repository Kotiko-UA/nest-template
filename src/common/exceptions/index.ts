// src/common/exceptions/index.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';
import { ErrorCodes } from 'src/common/statusCodes/errors';

export class BadRequestAppException extends AppException {
  constructor(code: ErrorCodes) {
    super(code, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedAppException extends AppException {
  constructor(code: ErrorCodes) {
    super(code, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenAppException extends AppException {
  constructor(code: ErrorCodes) {
    super(code, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundAppException extends AppException {
  constructor(code: ErrorCodes) {
    super(code, HttpStatus.NOT_FOUND);
  }
}

export class ConflictAppException extends AppException {
  constructor(code: ErrorCodes) {
    super(code, HttpStatus.CONFLICT);
  }
}
