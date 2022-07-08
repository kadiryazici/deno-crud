import {
  accessTokenExpirationTime,
  accessTokenSecret,
  refreshTokenExpirationTime,
  refreshTokenSecret,
} from '@/common/constants.ts';
import { create, getNumericDate } from 'djwt';

import { Option } from 'oxide.ts';
import { User } from 'types';
import { useDb } from '../db/index.ts';

export class UserService {
  public createUserAccessToken(id: string): Promise<string> {
    return create(
      { alg: 'HS256', typ: 'JWT' },
      {
        id,
        exp: getNumericDate(accessTokenExpirationTime),
      },
      accessTokenSecret,
    );
  }

  public createUserRefreshToken(id: string): Promise<string> {
    return create(
      { alg: 'HS256', typ: 'JWT' },
      {
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
