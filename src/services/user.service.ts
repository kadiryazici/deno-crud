import { Option, Result, Ok, Err } from 'oxide.ts';
import { appConfig } from '@/common/constants.ts';
import { create, getNumericDate, verify } from 'djwt';

import { User, TokenPayload } from 'types';
import { ErrorCodes } from '@/common/constants.ts';
import { DatabaseService } from './database.service.ts';
import { AutoInjectable, Singleton } from 'alosaur';

import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.0/mod.ts';

@Singleton()
@AutoInjectable()
export class UserService {
  private tokenPrefix = 'Bearer ';

  constructor(private db?: DatabaseService) {}

  public hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password);
  }

  public comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  public createUserAccessToken(id: string): Promise<string> {
    return create(
      { alg: 'HS256', typ: 'JWT' },
      <TokenPayload>{
        id,
        exp: getNumericDate(appConfig.accessTokenExpireTime),
      },
      appConfig.accessTokenSecret,
    );
  }

  public async verifyUserAccessToken(token: string): Promise<Result<TokenPayload, ErrorCodes.InvalidToken>> {
    try {
      const payload = (await verify(
        token.slice(this.tokenPrefix.length), //
        appConfig.accessTokenSecret,
        'HS256',
      )) as TokenPayload;
      return Ok(payload);
    } catch {
      return Err(ErrorCodes.InvalidToken);
    }
  }

  public createUserRefreshToken(id: string): Promise<string> {
    return create(
      { alg: 'HS256', typ: 'JWT' },
      <TokenPayload>{
        id,
        exp: getNumericDate(appConfig.refreshTokenExpireTime),
      },
      appConfig.refreshTokenSecret,
    );
  }

  public async verifyUserRefreshToken(token: string): Promise<Result<TokenPayload, ErrorCodes.InvalidToken>> {
    try {
      const payload = (await verify(
        token, //
        appConfig.refreshTokenSecret,
        'HS256',
      )) as TokenPayload;
      return Ok(payload);
    } catch {
      return Err(ErrorCodes.InvalidToken);
    }
  }

  public getUserByValue<Key extends keyof User>(key: Key, value: User[Key]): Option<User> {
    return Option(this.db?.value().users.find((user) => user[key] === value));
  }
}
