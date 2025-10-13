import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const res: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message };

    const message =
      typeof res === 'string' ? res : (res.message ?? 'Internal server error');
    const code = res.code ?? undefined;

    response.status(status).json({
      statusCode: status,
      message,
      ...(code && { code }),
    });
  }
}
