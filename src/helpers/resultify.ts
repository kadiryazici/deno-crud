import { Result, Ok, Err } from 'oxide.ts';

export function resultify<O, E>(cb: () => O): Result<O, E> {
  try {
    return Ok(cb());
  } catch (error) {
    return Err(error);
  }
}

export async function resultifyAsync<O, E>(cb: () => Promise<O>): Promise<Result<O, E>> {
  try {
    return Ok(await cb());
  } catch (error) {
    return Err(error);
  }
}
