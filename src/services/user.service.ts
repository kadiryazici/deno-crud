import { Option, Result, Ok, Err } from 'oxide.ts';
import { appConfig } from '@/common/constants.ts';
import { create, getNumericDate, verify } from 'djwt';

import { User, TokenPayload } from 'types';
import { useDb } from '../db/index.ts';
import { ErrorCodes } from '@/common/constants.ts';

export class UserService {
  private tokenStart = 'Bearer ';

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
        token.slice(this.tokenStart.length), //
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
    const db = useDb();
    return Option(db.users.find((user) => user[key] === value));
  }
}
