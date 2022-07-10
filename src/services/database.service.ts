import * as path from 'path';

import { fileExistsSync, getRoot } from 'helpers';

import { IDatabase } from 'types';
import { NOOP } from '@/common/constants.ts';

// deno-lint-ignore no-explicit-any
const defaults: Record<keyof IDatabase, () => any> = {
  users: () => [],
  comments: () => [],
  questions: () => [],
  userRefreshTokens: () => [],
};

export class DatabaseService {
  private static current = {} as IDatabase;
  private static saveTimeout = -1;
  private static root = getRoot();

  private static getFixed(db: IDatabase) {
    const requiredDb = { ...db } as IDatabase;

    for (const key of Object.keys(defaults)) {
      requiredDb[key as keyof IDatabase] ||= defaults[key as keyof IDatabase]();
    }

    return requiredDb;
  }

  public static init() {
    if (!fileExistsSync(path.join(DatabaseService.root, 'db.json'))) {
      Deno.writeTextFileSync(
        path.join(DatabaseService.root, 'db.json'),
        JSON.stringify(DatabaseService.current, null, 2),
      );
    }

    const dbText = Deno.readTextFileSync(path.join(DatabaseService.root, 'db.json'));

    try {
      DatabaseService.current = DatabaseService.getFixed(JSON.parse(dbText) as IDatabase);
    } catch {
      DatabaseService.current = DatabaseService.getFixed({} as IDatabase);
    }
  }

  public value() {
    return DatabaseService.current;
  }

  // @ts-expect-error promise thing
  public save<R extends Promise<void> | void>(cb: (db: IDatabase) => R = NOOP): R {
    if (cb) {
      const cbReturn = cb(DatabaseService.current);
      if (cbReturn instanceof Promise) {
        // @ts-expect-error promise detection
        return cbReturn.then(() => {
          this.saveFileTimeout();
        });
      }
    }

    this.saveFileTimeout();
  }

  // @ts-expect-error promise thing
  public set<R extends Promise<void> | void>(cb: (db: IDatabase) => R = NOOP): R {
    const cbReturn = cb(DatabaseService.current);
    if (cbReturn instanceof Promise) {
      // @ts-expect-error promise detection
      return new Promise((resolve) => cbReturn.then(() => resolve()));
    }
  }

  private saveFileTimeout() {
    clearTimeout(DatabaseService.saveTimeout);

    DatabaseService.saveTimeout = setTimeout(() => {
      Deno.writeTextFileSync(
        path.join(DatabaseService.root, 'db.json'),
        JSON.stringify(DatabaseService.current, null, 2),
      );
    });
  }
}
