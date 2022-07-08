import { HttpContext, type HookTarget, Content } from 'alosaur';
import { validateOrReject, ValidationError } from 'class-validator';
import { ErrorResponse } from 'types';
import { ErrorCodes } from '@/common/constants.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';
import { plainToInstance } from 'class-transformer';
import { resultifyAsync } from 'helpers';
import { type Result } from 'oxide.ts';
interface Payload {
  // deno-lint-ignore no-explicit-any
  instance: any;
  transform?: boolean;
}
export class Validate implements HookTarget<unknown, Payload> {
  async onPreAction(context: HttpContext<unknown>, { instance, transform = true }: Payload) {
    let body = await context.request.body();

    if (transform) {
      body = plainToInstance(instance, body);
    }

    const valid: Result<void, ValidationError[]> = await resultifyAsync(() => validateOrReject(body));

    if (valid.isErr()) {
      const errors = valid.unwrapErr();

      context.response.result = Content(
        {
          success: false,
          code: ErrorCodes.ValidationError,
          errors,
        } as ErrorResponse,
        HttpStatusCode.BAD_REQUEST,
      );

      context.response.setImmediately();
    }
  }
}
