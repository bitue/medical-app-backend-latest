import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    //    console.log(request, 'from current user middleware ----->>');
    // console.log(
    //   request.user,
    //   '------------------------------------------->>>>>',
    // );
    return request.user;
  },
);
