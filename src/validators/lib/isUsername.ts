/**
 * @description Username format checker.
 * Current constraints are:
 * - 3-15 chars
 * - only letters and numbers (case insensitive), as well as '_' (underscore)
 * - can't start with a number
 * 
 * @param nametag
 * @returns true if nametag format is correct, false otherwise.
 */

export const isUsername = (name: string): boolean => {
    return /^[a-z][a-z0-9_]{3,15}$/i.test(name);
}