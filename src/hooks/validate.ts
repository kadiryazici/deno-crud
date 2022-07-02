import { HttpContext, type HookTarget, Content } from 'alosaur';
import { validateOrReject } from 'class-validator';
import { ErrorResponse } from 'types';
import { ErrorCodes } from '@/common/constants.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';
import { transformBodyOfContext } from '@/helpers/index.ts';

// deno-lint-ignore no-explicit-any
export class MyHook implements HookTarget<unknown, any> {
  // deno-lint-ignore no-explicit-any
  async onPreAction(context: HttpContext<unknown>, instance: any) {
    const transformedBody = await transformBodyOfContext(context, instance);

    try {
      await validateOrReject(transformedBody);
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
