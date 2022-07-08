import { HttpContext, type HookTarget, Content } from 'alosaur';
import { validateOrReject } from 'class-validator';
import { ErrorResponse } from 'types';
import { ErrorCodes } from '@/common/constants.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';
import { plainToInstance } from 'class-transformer';

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

    try {
      await validateOrReject(body);
    } catch (errors) {
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
