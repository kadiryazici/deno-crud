import { Controller, Post, Body, UseHook, Content, ActionResult } from 'alosaur';
import { ErrorCodes, SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse, TransformValue, ErrorResponse, LoginResponse } from 'types';
import { saveDb, useDb } from 'db';
import { getUTCNow, getFixedUsername } from 'helpers';
import { nanoid } from 'nanoid';
import { Length, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Validate } from '@/hooks/validate.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';
import { UserService } from '@/services/user.service.ts';

interface AuthBody {
  username: string;
  password: string;
}

class SignupBodyModel implements AuthBody {
  @Length(4, 24)
  @IsString()
  @Transform(({ value }: TransformValue<string>) => getFixedUsername(value))
  username!: string;

  @Length(6, 25)
  @IsString()
  password!: string;
}

class LoginBodyModel implements AuthBody {
  @Length(4, 24)
  @IsString()
  public username!: string;

  @Length(6, 25)
  @IsString()
  public password!: string;
}

@Controller('/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/signup')
  @UseHook(Validate, { instance: SignupBodyModel })
  public async signup(@Body(SignupBodyModel) body: AuthBody): Promise<ActionResult> {
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

  @Post('/login')
  @UseHook(Validate, { instance: LoginBodyModel, transform: false })
  public async login(@Body() body: AuthBody): Promise<ActionResult> {
    const db = useDb();
    const foundUser = db.users.find((user) => user.username === body.username && user.password === body.password);

    if (foundUser) {
      return Content({
        accessToken: await this.userService.createUserAccessToken(foundUser.id),
        refreshToken: await this.userService.createUserRefreshToken(foundUser.id),
        id: foundUser.id,
        username: foundUser.username,
      } as LoginResponse);
    }

    return Content(
      {
        code: ErrorCodes.WrongUsernameOrPassword,
        errors: [],
        success: false,
      } as ErrorResponse,
      HttpStatusCode.NOT_FOUND,
    );
  }
}
