import { App, Area } from 'alosaur';

import { DatabaseService } from '@/services/database.service.ts';
import { QuestionController } from './controllers/question.controller.ts';
import { UserController } from './controllers/user.controller.ts';
import { appConfig } from '@/common/constants.ts';
import { plainToInstance } from 'class-transformer';
import setupConfig from '@/setups/setupConfig.ts';
import setupRefreshTokenControl from '@/setups/setupRefreshTokenControl.ts';

DatabaseService.init();
setupConfig();
setupRefreshTokenControl();

@Area({
  controllers: [UserController, QuestionController],
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

app.listen({
  port: appConfig.port,
});
