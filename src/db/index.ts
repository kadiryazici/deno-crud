import * as path from 'path';
import { getRoot } from '../helpers/getRoot.ts';
import { Comment, Question, User, UserRefreshToken } from 'types';

const root = getRoot();

// deno-lint-ignore no-explicit-any
let currentDB = null as any;

interface Db {
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
  try {
    Deno.statSync(path.join(root, 'db.json'));
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw new Error('Note founde');

    Deno.writeTextFileSync(path.join(root, 'db.json'), JSON.stringify(getFixedDb(), null, 2));
  }

  const dbText = Deno.readTextFileSync(path.join(root, 'db.json'));
  const dbData: Db = JSON.parse(dbText);
  currentDB = dbData;
}

export function useDb() {
  return currentDB as Db;
}

export async function saveDb(cb?: (db: Db) => Promise<unknown> | unknown) {
  if (cb) await Promise.resolve(cb(currentDB));

  await Deno.writeTextFile(path.join(root, 'db.json'), JSON.stringify(getFixedDb(currentDB), null, 2));
}
