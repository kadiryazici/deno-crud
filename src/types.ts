export enum SuccessCodes {
  SignupSuccessful = 'SignupSuccessful',
}

export enum ErrorCodes {
  SignupError = 'SignupError',
}

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
}
