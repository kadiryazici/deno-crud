import { Controller, Post, Body, UseHook } from 'alosaur';
import { SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse, TransformValue } from 'types';
import { saveDb } from 'db';
import { getUTCNow } from 'helpers';
import { nanoid } from 'nanoid';
import { MinLength, MaxLength, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Validate } from '@/hooks/validate.ts';

class UserModel {
  @MinLength(4)
  @MaxLength(6)
  @IsString()
  @Transform(({ value }: TransformValue<string>) => value.replace(/\s/g, ''))
  username!: string;

  @MinLength(6)
  @MaxLength(25)
  @IsString()
  password!: string;
}

@Controller('/user')
export class UserController {
  @Post('/signup')
  @UseHook(Validate, UserModel)
  async signup(@Body(UserModel) body: UserModel): Promise<SuccessResponse> {
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
