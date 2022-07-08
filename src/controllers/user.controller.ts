import { Controller, Post, Body, UseHook, Content, ActionResult } from 'alosaur';
import { ErrorCodes, SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse, TransformValue, ErrorResponse, LoginResponse } from 'types';
import { getUTCNow, getFixedUsername } from 'helpers';
import { nanoid } from 'nanoid';
import { Length, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Validate } from '@/hooks/validate.ts';
import { HttpStatusCode } from '@/common/httpCode.ts';
import { DatabaseService } from '@/services/database.service.ts';
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
  constructor(
    private userService: UserService, //
    private db: DatabaseService,
  ) {}

  @Post('/signup')
  @UseHook(Validate, { instance: SignupBodyModel })
  public async signup(@Body(SignupBodyModel) body: AuthBody): Promise<ActionResult> {
    if (this.userService.getUserByUsername(body.username).isSome()) {
      return Content(
        {
          code: ErrorCodes.UserAlreadyExists,
          errors: [],
          success: false,
        } as ErrorResponse,
        HttpStatusCode.CONFLICT,
      );
    }

    const now = getUTCNow();

    await this.db.setAndSave((db) => {
      db.users.push({
        creationDate: now,
        id: nanoid(),
        password: body.password,
        username: body.username,
      });
    });

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
    const foundUser = this.userService.getUserByUsername(body.username);

    if (foundUser.isNone()) {
      return Content(
        {
          code: ErrorCodes.WrongUsernameOrPassword,
          errors: [],
          success: false,
        } as ErrorResponse,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const user = foundUser.unwrap();

    const responseData: LoginResponse = {
      accessToken: await this.userService.createUserAccessToken(user.id),
      refreshToken: await this.userService.createUserRefreshToken(user.id),
      id: user.id,
      username: user.username,
    };

    await this.db.setAndSave((db) => {
      db.userRefreshTokens.push({
        userId: user.id,
        token: responseData.refreshToken,
      });
    });

    return Content(responseData);
  }
}
