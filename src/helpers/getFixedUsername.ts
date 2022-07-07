import { allowedUsernameCharacters } from '@/common/constants.ts';

export const getFixedUsername = (username: string) =>
  [...username]
    .filter((character) => allowedUsernameCharacters.includes(character))
    .join('')
    .replace(/\s+/, ' ')
    .trim();
