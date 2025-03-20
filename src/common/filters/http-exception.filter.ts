// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { CommonResponseDto } from '../dtos/common-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody: CommonResponseDto = {
            code: status.toString(),
            message: exception instanceof HttpException ? exception.message : 'Internal Server Error',
            data: null, // Default to null for non-validation errors
            status : false
        };

        // Handle validation errors specifically
        if (status === HttpStatus.BAD_REQUEST && exception instanceof HttpException) {
            const validationErrors = exception.getResponse() as any;

            if (Array.isArray(validationErrors.message)) {
                responseBody.data = validationErrors.message;
            }
        }


        response.send(responseBody);
    }
}