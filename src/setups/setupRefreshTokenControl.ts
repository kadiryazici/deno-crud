import { DatabaseService } from '@/services/database.service.ts';
import { Mutex } from 'https://cdn.skypack.dev/async-mutex?dts';
import { UserService } from '@/services/user.service.ts';
import { cron } from 'deno-cron';

const dbService = new DatabaseService();
const userService = new UserService();

const mutex = new Mutex();

export default function () {
  cron(`1 */10 * * * *`, () => {
    console.log('Checking refresh tokens to remove');

    const willBeRemovedTokens: string[] = [];
    const promises: Promise<void>[] = [];

    dbService.set((db) =>
      mutex.runExclusive(async () => {
        for (const { token } of db.userRefreshTokens) {
          promises.push(
            new Promise((resolve) => {
              userService.verifyUserRefreshToken(token).then((result) => {
                if (result.isOk()) resolve();
                else {
                  willBeRemovedTokens.push(token);
                  resolve();
                }
              });
            }),
          );
        }

        await Promise.all(promises);
      }),
    );

    dbService.setAndSave((db) =>
      mutex.runExclusive(() => {
        db.userRefreshTokens = db.userRefreshTokens.filter((item) => !willBeRemovedTokens.includes(item.token));
      }),
    );
  });
}
