import { type ErrorCodes, type SuccessCodes } from './common/constants.ts';

export type TransformValue<T> = { value: T };

export interface User {
  id: string;
  username: string;
  password: string;
  creationDate: number;
}

export interface UserRefreshToken {
  id: string;
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
