import { App, Area } from 'alosaur';
import { initDB } from './db/index.ts';
import { UserController } from './controllers/user.controller.ts';
import { plainToInstance } from 'class-transformer';

initDB();

@Area({
  controllers: [UserController],
})
class MainArea {}

const app = new App({
  areas: [MainArea],
});

app.useTransform({
  type: 'body',
  // deno-lint-ignore no-explicit-any
  getTransform: (transform: any, body: any) => {
    return plainToInstance(transform, body);
  },
});

app.listen(':4000');
