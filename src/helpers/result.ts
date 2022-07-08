// deno-lint-ignore-file no-explicit-any
import { Err, Ok, Result } from 'oxide.ts';

type MaybePromiseResult<Data, Error> = Data extends Promise<infer D> ? Promise<Result<D, Error>> : Result<Data, Error>;

export function resultFromCb<O, E>(cb: () => O): MaybePromiseResult<O, E>;
export function resultFromCb(cb: () => any): any {
  try {
    const data = cb();
    if (data instanceof Promise) {
      return new Promise((resolve) =>
        data //
          .then((_data) => resolve(Ok(_data)))
          .catch((error) => resolve(Err(error))),
      );
    }

    return Ok(data);
  } catch (error) {
    return Err(error);
  }
}
