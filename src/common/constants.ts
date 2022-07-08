export enum SuccessCodes {
  SignupSuccessful = 'SignupSuccessful',
}

export enum ErrorCodes {
  SignupError = 'SignupError',
  ValidationError = 'ValidationError',
  UserAlreadyExists = 'UserAlreadyExists',
  WrongUsernameOrPassword = 'WrongUsernameOrPassword',
  InvalidAccessToken = 'InvalidAccessToken',
  MissingAccessToken = 'MissingAccessToken',
}

export const allowedUsernameCharacters = 'abcdefghijklmnopqrstuwxyz1234567890 ';

export const accessTokenSecret =
  'aFnıjangıjpangpıjadfngjıpafngjansfSDF>adffjngadfgnadfhjlngRRT+^%VrsdgdfgcawtcfgcwrthVERYGHJSfdgavrjnfhasn';

export const refreshTokenSecret =
  'adfjnafısgnfıepgnarfgRQT^4tverwgcaw34543564567567yHVSsdadfertryu536EDFgvqeryertubdrtghSVDFgFDgvfdgsd';

export const accessTokenExpirationTime = 60 * 60;
export const refreshTokenExpirationTime = 60 * 60 * 24 * 7;
