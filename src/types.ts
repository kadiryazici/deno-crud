import { type ErrorCodes, type SuccessCodes } from './common/constants.ts';
import { Payload } from 'djwt';

export type TransformValue<T> = { value: T };

export interface User {
  id: string;
  username: string;
  password: string;
  creationDate: number;
}

export interface UserRefreshToken {
  userId: string;
  token: string;
}

export interface Question {
  id: string;
  userId: string;
  body: string;
  title: string;
  creationDate: number;
  lastUpdateDate: number;
  upVotes: number;
  downVotes: number;
}

export interface Comment {
  id: string;
  userId: string;
  questionId: string;
  creationDate: number;
  lastUpdateDate: number;
}

export interface SuccessResponse {
  success: true;
  code: SuccessCodes;
}

export interface ErrorResponse {
  success: false;
  code: ErrorCodes;
  errors: unknown[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: string;
  username: string;
}

export interface TokenPayload extends Payload {
  id: string;
}

export interface AppConfig {
  port: number;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpireTime: number; // second
  refreshTokenExpireTime: number; // second
}

export interface RefreshPayload {
  token: string;
}
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
