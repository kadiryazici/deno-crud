import * as path from 'path';

import { Comment, Question, User, UserRefreshToken } from 'types';

import { fileExistsSync } from 'helpers';
import { getRoot } from '../helpers/getRoot.ts';

const root = getRoot();

// deno-lint-ignore no-explicit-any
let currentDB = null as any;

export interface Db {
  users: User[];
  comments: Comment[];
  questions: Question[];
  userRefreshTokens: UserRefreshToken[];
}

const defaults: { [Key in keyof Db]: () => unknown } = {
  users: () => [],
  comments: () => [],
  questions: () => [],
  userRefreshTokens: () => [],
};

function getFixedDb(db: Partial<Db> = {}) {
  // deno-lint-ignore no-explicit-any
  const requiredDb = { ...db } as Record<string, any>;

  for (const key of Object.keys(defaults)) {
    requiredDb[key] ||= defaults[key as keyof typeof defaults]();
  }

  return requiredDb;
}

export function initDB() {
  if (!fileExistsSync(path.join(root, 'db.json'))) {
    Deno.writeTextFileSync(path.join(root, 'db.json'), JSON.stringify(getFixedDb(), null, 2));
  }

  const dbText = Deno.readTextFileSync(path.join(root, 'db.json'));
  const dbData: Db = JSON.parse(dbText);
  currentDB = dbData;
}

export function useDb() {
  return currentDB as Db;
}

let saveTimeoutId = -1;

export async function saveDb(cb?: (db: Db) => Promise<void> | void) {
  clearTimeout(saveTimeoutId);

  if (cb) await Promise.resolve(cb(currentDB));

  saveTimeoutId = setTimeout(() => {
    Deno.writeTextFile(path.join(root, 'db.json'), JSON.stringify(getFixedDb(currentDB), null, 2));
  });
}

export function setWithoutSave<Callback extends (db: Db) => Promise<void> | void>(cb: Callback): ReturnType<Callback> {
  return cb(currentDB) as ReturnType<Callback>;
}
