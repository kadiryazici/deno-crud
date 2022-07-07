import { Controller, Post, Body, UseHook, Content, ActionResult } from 'alosaur';
import { ErrorCodes, SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse, TransformValue, ErrorResponse } from 'types';
import { saveDb, useDb } from 'db';
import { getUTCNow, getFixedUsername } from 'helpers';
import { nanoid } from 'nanoid';
import { Length, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Validate } from '@/hooks/validate.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';

class UserModel {
  @Length(4, 24)
  @IsString()
  @Transform(({ value }: TransformValue<string>) => getFixedUsername(value))
  username!: string;

  @Length(6, 25)
  @IsString()
  password!: string;
}

@Controller('/user')
export class UserController {
  @Post('/signup')
  @UseHook(Validate, UserModel)
  async signup(@Body(UserModel) body: UserModel): Promise<ActionResult> {
    {
      const db = useDb();
      const foundUser = db.users.find((user) => user.username === body.username);
      if (foundUser) {
        return Content(
          {
            code: ErrorCodes.UserAlreadyExists,
            errors: [],
            success: false,
          } as ErrorResponse,
          HttpStatusCode.CONFLICT,
        );
      }
    }

    const now = getUTCNow();

    await saveDb((db) =>
      db.users.push({
        creationDate: now,
        id: nanoid(),
        password: body.password,
        username: body.username,
      }),
    );

    return Content(
      {
        success: true,
        code: SuccessCodes.SignupSuccessful,
      } as SuccessResponse,
      HttpStatusCode.OK,
    );
  }
}
