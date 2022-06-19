import { Controller, Post, Body } from 'alosaur';
import { SuccessCodes, SuccessResponse } from 'types';
import { saveDb } from 'db';
import { getUTCNow } from 'helpers';
import { nanoid } from 'nanoid';

interface SignupBody {
  username: string;
  password: string;
}

@Controller('/user')
export class UserController {
  @Post('/signup')
  async signup(@Body() body: SignupBody): Promise<SuccessResponse> {
    const now = getUTCNow();

    await saveDb((db) =>
      db.users.push({
        creationDate: now,
        id: nanoid(),
        password: body.password,
        username: body.username,
      }),
    );

    return {
      success: true,
      code: SuccessCodes.SignupSuccessful,
    };
  }
}
