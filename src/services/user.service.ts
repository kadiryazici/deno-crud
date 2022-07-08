import { Option, Result, Ok, Err } from 'oxide.ts';
import {
  accessTokenExpirationTime,
  accessTokenSecret,
  refreshTokenExpirationTime,
  refreshTokenSecret,
} from '@/common/constants.ts';
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
        exp: getNumericDate(accessTokenExpirationTime),
      },
      accessTokenSecret,
    );
  }

  public async verifyUserAccessToken(token: string): Promise<Result<TokenPayload, ErrorCodes.InvalidAccessToken>> {
    try {
      const payload = (await verify(
        token.slice(this.tokenStart.length), //
        accessTokenSecret,
        'HS256',
      )) as TokenPayload;
      return Ok(payload);
    } catch {
      return Err(ErrorCodes.InvalidAccessToken);
    }
  }

  public createUserRefreshToken(id: string): Promise<string> {
    return create(
      { alg: 'HS256', typ: 'JWT' },
      <TokenPayload>{
        id,
        exp: getNumericDate(refreshTokenExpirationTime),
      },
      refreshTokenSecret,
    );
  }

  public getUserByUsername(username: string): Option<User> {
    const db = useDb();
    return Option(db.users.find((user) => user.username === username));
  }
}
