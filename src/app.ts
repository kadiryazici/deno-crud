import { App, Area } from 'alosaur';
import { initDB } from './db/index.ts';
import { UserController } from './controllers/user.controller.ts';

initDB();

@Area({
  controllers: [UserController],
})
class HomeArea {}

const app = new App({
  areas: [HomeArea],
});

app.listen(':4000');
