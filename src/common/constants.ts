import { AppConfig } from 'types';

export enum SuccessCodes {
  SignupSuccessful = 'SignupSuccessful',
}

export enum ErrorCodes {
  SignupError = 'SignupError',
  ValidationError = 'ValidationError',
  UserAlreadyExists = 'UserAlreadyExists',
  WrongUsernameOrPassword = 'WrongUsernameOrPassword',
  InvalidToken = 'InvalidToken',
  MissingToken = 'MissingToken',
}

export const allowedUsernameCharacters = 'abcdefghijklmnopqrstuwxyz1234567890 ';

export const appConfig: AppConfig = Object.preventExtensions({
  port: 4000,
  accessTokenExpireTime: 60 * 60,
  refreshTokenExpireTime: 60 * 60 * 24 * 7,
  accessTokenSecret:
    'aFnıjangıjpangpıjadfngjıpafngjansfSDF>adffjngadfgnadfhjlngRRT+^%VrsdgdfgcawtcfgcwrthVERYGHJSfdgavrjnfhasn',
  refreshTokenSecret:
    'adfjnafısgnfıepgnarfgRQT^4tverwgcaw34543564567567yHVSsdadfertryu536EDFgvqeryertubdrtghSVDFgFDgvfdgsd',
});
