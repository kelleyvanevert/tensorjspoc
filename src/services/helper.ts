const normalize = (value: number, min: number, max: number) => {
    if (value < min || value > max) {
        throw `Value not within range. Should be between ${min} & ${max}`;
    }
    return (value - min) / (max - min)
}

const getRandomIntInclusive = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

const getRandomElement = (arr: any[]): any => {
    return  arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined
}

export { normalize, getRandomIntInclusive, getRandomElement }