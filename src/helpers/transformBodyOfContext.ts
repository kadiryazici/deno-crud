import { plainToInstance } from 'class-transformer';
import { HttpContext } from 'alosaur';

// deno-lint-ignore no-explicit-any
export async function transformBodyOfContext(context: HttpContext<unknown>, instance: any) {
  return plainToInstance(instance, await context.request.body());
}
