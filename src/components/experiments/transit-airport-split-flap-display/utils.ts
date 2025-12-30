import { CHAR_SET, NUMERIC_SET, TIME_SET, ALPHANUMERIC_SET } from './constants';

export function sanitizeChar(char: string, charSet: string = CHAR_SET): string {
    const sanitized = char.toUpperCase();
    return charSet.includes(sanitized) ? sanitized : " ";
}

export function getSafeIndex(char: string, charSet: string = CHAR_SET): number {
    const index = charSet.indexOf(char);
    return index === -1 ? 0 : index;
}

export function getNextChar(currentChar: string, charSet: string = CHAR_SET): string {
    const currentIndex = getSafeIndex(currentChar, charSet);
    const nextIndex = (currentIndex + 1) % charSet.length;
    return charSet[nextIndex];
}

export function getPreviousChar(currentChar: string, charSet: string = CHAR_SET): string {
    const currentIndex = getSafeIndex(currentChar, charSet);
    const prevIndex = (currentIndex - 1 + charSet.length) % charSet.length;
    return charSet[prevIndex];
}

export function getBestCharSet(text: string): string {
    // Check if it's purely numeric (excluding spaces)
    if (/^[0-9 ]+$/.test(text)) {
        return NUMERIC_SET;
    }

    // Check if it's a time-like string (numbers, colon, space)
    if (/^[0-9: ]+$/.test(text)) {
        return TIME_SET;
    }

    // Default to alphanumeric
    return ALPHANUMERIC_SET;
}
