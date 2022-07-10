import { HttpContext, type HookTarget, Content } from 'alosaur';
import { Option } from 'oxide.ts';
import { ErrorResponse } from 'types';
import { ErrorCodes } from '@/common/constants.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';
import { UserService } from '@/services/user.service.ts';

export interface AuthHookState {
  userId: string;
}

interface TokenPayload {
  id: string;
}

export class Auth implements HookTarget<AuthHookState, unknown> {
  private static userService = new UserService();

  public async onPreAction(context: HttpContext<AuthHookState>) {
    const tokenOption = Option(context.request.headers.get('Authorization'));

    if (tokenOption.isNone()) {
      context.response.result = Content(
        {
          code: ErrorCodes.MissingToken,
          errors: [],
          success: false,
        } as ErrorResponse,
        HttpStatusCode.BAD_REQUEST,
      );
      return context.response.setImmediately();
    }

    const tokenResult = await Auth.userService.verifyUserAccessToken(tokenOption.unwrap());

    if (tokenResult.isErr()) {
      const code = tokenResult.unwrapErr();

      context.response.result = Content(
        <ErrorResponse>{
          code,
          errors: [],
          success: false,
        },
        HttpStatusCode.UNAUTHORIZED,
      );
      return context.response.setImmediately();
    }

    context.state = {
      userId: tokenResult.unwrap().id,
    };
  }
}
