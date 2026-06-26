import { CHAR_SET } from "./constants";

export function sanitizeChar(char: string, charSet: string = CHAR_SET): string {
  const sanitized = char.toUpperCase();
  return charSet.includes(sanitized) ? sanitized : " ";
}

export function getSafeIndex(char: string, charSet: string = CHAR_SET): number {
  const index = charSet.indexOf(char);
  return index === -1 ? 0 : index;
}

export function getNextChar(
  currentChar: string,
  charSet: string = CHAR_SET
): string {
  const currentIndex = getSafeIndex(currentChar, charSet);
  const nextIndex = (currentIndex + 1) % charSet.length;
  return charSet[nextIndex];
}

export function getPreviousChar(
  currentChar: string,
  charSet: string = CHAR_SET
): string {
  const currentIndex = getSafeIndex(currentChar, charSet);
  const prevIndex = (currentIndex - 1 + charSet.length) % charSet.length;
  return charSet[prevIndex];
}
