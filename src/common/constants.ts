export enum SuccessCodes {
  SignupSuccessful = 'SignupSuccessful',
}

export enum ErrorCodes {
  SignupError = 'SignupError',
  ValidationError = 'ValidationError',
  UserAlreadyExists = 'UserAlreadyExists',
}

export const allowedUsernameCharacters = 'abcdefghijklmnopqrstuwxyz1234567890 ';
