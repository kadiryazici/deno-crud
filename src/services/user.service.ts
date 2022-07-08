import {
  accessTokenSecret,
  refreshTokenSecret,
  refreshTokenExpirationTime,
  accessTokenExpirationTime,
} from '@/common/constants.ts';
import { create, getNumericDate } from 'djwt';

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
}
