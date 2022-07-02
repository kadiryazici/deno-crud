import { Controller, Post, Body, UseHook, Ctx, HttpContext } from 'alosaur';
import { SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse, TransformValue } from 'types';
import { saveDb } from 'db';
import { getUTCNow } from 'helpers';
import { nanoid } from 'nanoid';
import { MinLength, MaxLength, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { MyHook } from '@/hooks/validate.ts';

class UserDTO {
  @MinLength(4)
  @MaxLength(6)
  @IsString()
  @Transform(({ value }: TransformValue<string>) => value.replaceAll(' ', ''))
  username!: string;

  @MinLength(6)
  @MaxLength(25)
  @IsString()
  password!: string;
}

@Controller('/user')
export class UserController {
  @Post('/signup')
  @UseHook(MyHook, UserDTO)
  async signup(@Body(UserDTO) body: UserDTO, @Ctx() ctx: HttpContext): Promise<SuccessResponse> {
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
