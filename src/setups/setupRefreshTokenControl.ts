import { AutoInjectable } from 'alosaur';
import { DatabaseService } from '@/services/database.service.ts';
import { Mutex } from 'https://cdn.skypack.dev/async-mutex?dts';
import { UserService } from '@/services/user.service.ts';
import { cron } from 'deno-cron';

// const dbService = new DatabaseService();
// const userService = new UserService();

@AutoInjectable()
class RefreshTokenControlSetup {
  private mutex = new Mutex();
  constructor(private user?: UserService, private db?: DatabaseService) {}

  public run() {
    const willBeRemovedTokens: string[] = [];
    const promises: Promise<void>[] = [];

    this.db?.set((db) =>
      this.mutex.runExclusive(async () => {
        for (const { token } of db.userRefreshTokens) {
          promises.push(
            new Promise((resolve) => {
              this.user?.verifyUserRefreshToken(token).then((result) => {
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

    this.db?.save((db) =>
      this.mutex.runExclusive(() => {
        db.userRefreshTokens = db.userRefreshTokens.filter((item) => !willBeRemovedTokens.includes(item.token));
      }),
    );
  }
}

export default function () {
  const setup = new RefreshTokenControlSetup();

  cron(`1 */10 * * * *`, () => {
    console.log('Job running: RefreshTokenControl');
    setup.run();
  });
}
