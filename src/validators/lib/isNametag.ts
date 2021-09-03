/**
 * @description Nametag format checker.
 * 
 * @param nametag
 * @returns true if nametag format is correct, false otherwise.
 */

export const isNametag = (nametag: string): boolean => {
    if ( /^[a-z][a-z0-9_]{3,15}#[0-9]{4}$/i.test(nametag)) {
        console.log(nametag);
        console.log(true);
        return true;
    }
    return false;
}