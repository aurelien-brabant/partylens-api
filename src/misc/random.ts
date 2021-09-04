export const generateRandomIndexes = (n: number, size: number): number[] => {
    const nbs = [Math.round(Math.random() * (size - 1))];

    let i = 1;

    while (i < n) {
        let nb = Math.round(Math.random() * (size - 1));
        if (nbs.includes(nb)) continue ;
        nbs.push(nb);
        ++i;
    } 

    return nbs;
}