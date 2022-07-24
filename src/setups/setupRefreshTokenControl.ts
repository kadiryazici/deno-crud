import { AutoInjectable } from 'alosaur';
import { DatabaseService } from '@/services/database.service.ts';
import { Mutex } from 'https://cdn.skypack.dev/async-mutex?dts';
import { UserService } from '@/services/user.service.ts';
import { cron } from 'deno-cron';
import pMap from 'https://cdn.skypack.dev/p-map?dts';

// const dbService = new DatabaseService();
// const userService = new UserService();

@AutoInjectable()
class ExpiredRefreshTokenCleanerJob {
  private mutex = new Mutex();
  constructor(private user?: UserService, private db?: DatabaseService) {}

  public async run() {
    const expiredTokens: string[] = [];
    const db = this.db!.value();

    await pMap(
      db.userRefreshTokens,
      async ({ token }) => {
        const result = await this.user!.verifyUserRefreshToken(token);
        if (result?.isErr()) {
          expiredTokens.push(token);
        }
      },
      { concurrency: 10 },
    );

    this.db?.save((db) => {
      db.userRefreshTokens = db.userRefreshTokens.filter((item) => !expiredTokens.includes(item.token));
    });
  }
}

export default function () {
  const job = new ExpiredRefreshTokenCleanerJob();

  cron(`1 */10 * * * *`, () => {
    console.log('Job running: RefreshTokenControl');
    job.run();
  });
}
