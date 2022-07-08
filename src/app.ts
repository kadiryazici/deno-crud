import { App, Area } from 'alosaur';

import { UserController } from './controllers/user.controller.ts';
import { initDB } from './db/index.ts';
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
    if (transform == null) return body;
    return plainToInstance(transform, body);
  },
});

app.listen(':4000');
