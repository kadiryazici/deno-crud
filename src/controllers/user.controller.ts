import { Controller, Post, Body, UseHook, Content, ActionResult } from 'alosaur';
import { ErrorCodes, SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse, TransformValue, ErrorResponse, LoginResponse, RefreshResponse, RefreshPayload } from 'types';
import { getUTCNow, getFixedUsername } from 'helpers';
import { nanoid } from 'nanoid';
import { Length, IsString, IsJWT } from 'class-validator';
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

class RefreshBodyModel implements RefreshPayload {
  @IsString()
  @IsJWT()
  token!: string;
}

@Controller('/user')
export class UserController {
  constructor(
    private userService: UserService, //
    private db: DatabaseService,
  ) {}

  @Post('/signup')
  @UseHook(Validate, { instance: SignupBodyModel })
  public signup(@Body(SignupBodyModel) body: AuthBody): ActionResult {
    if (this.userService.getUserByValue('username', body.username).isSome()) {
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

    this.db.save((db) => {
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
    const foundUser = this.userService.getUserByValue('username', body.username);

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

    this.db.save((db) => {
      db.userRefreshTokens.push({
        userId: user.id,
        token: responseData.refreshToken,
      });
    });

    return Content(responseData);
  }

  @Post('/refresh')
  @UseHook(Validate, { instance: RefreshBodyModel, transform: false })
  public async refreshUserToken(@Body(RefreshBodyModel) body: RefreshBodyModel): Promise<ActionResult> {
    if (!this.db.value().userRefreshTokens.some((refresh) => refresh.token === body.token)) {
      return Content(
        {
          code: ErrorCodes.InvalidToken,
          errors: [],
          success: false,
        } as ErrorResponse,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const tokenResult = await this.userService.verifyUserRefreshToken(body.token);

    if (tokenResult.isErr()) {
      return Content(
        {
          code: tokenResult.unwrapErr(),
          errors: [],
          success: false,
        } as ErrorResponse,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const tokenPayload = tokenResult.unwrap();

    this.db.save((db) => {
      if (db.userRefreshTokens.length === 1) {
        db.userRefreshTokens.length = 0;
      } else {
        const index = db.userRefreshTokens.findIndex(({ userId }) => userId === tokenPayload.id);
        if (index >= 0) {
          const lastItem = db.userRefreshTokens.pop();
          db.userRefreshTokens[index] = lastItem!;
        }
      }
    });

    const responsePayload: RefreshResponse = {
      accessToken: await this.userService.createUserAccessToken(tokenPayload.id),
      refreshToken: await this.userService.createUserRefreshToken(tokenPayload.id),
    };

    this.db.save((db) => {
      db.userRefreshTokens.push({
        userId: tokenPayload.id,
        token: responsePayload.refreshToken,
      });
    });

    return Content(responsePayload);
  }
}
