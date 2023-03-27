

export function weightedHarmonicMean(numbers: number[], weights: number[]): number {
    if (numbers.length !== weights.length) {
      throw new Error("The length of numbers array and weights array must be the same.");
    }
    let sumWeightedValues = 0;
    let sumWeights = 0;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] === 0) {
        throw new Error("Cannot calculate harmonic mean when a value in the numbers array is zero.");
      }
      sumWeightedValues += weights[i] / numbers[i];
      sumWeights += weights[i];
    }
    return sumWeights / sumWeightedValues;
  }

export const ConvertScoresToProbabilityDistribution = (scores: number[], softmaxBeta: number): number[] => {
    let probabilities: number[] = []
    let softmaxDenomenator = 0
    const softmaxNumerators: number[] = []
    for (let i = 0; i < scores.length; i++) {
        let softmaxNumerator = Math.exp(softmaxBeta * scores[i]);
        softmaxDenomenator += softmaxNumerator
        softmaxNumerators.push(softmaxNumerator);
    }

    for (let i = 0; i < softmaxNumerators.length; i++) {
        probabilities.push(softmaxNumerators[i] / softmaxDenomenator)
    }
    return probabilities;
}

export const SampleFromProbabilityDistribution = (probs: number[]): number => {
    const sum = probs.reduce((a, b) => a + b, 0); // [1,2,3,4] = cumulative sum ie. 1+2+3+4=10
    if (sum <= 0) {
        throw Error('probs must sum to a value greater than zero')
    }
    const normalized = probs.map(prob => prob / sum) // [1,2,3,4] = transform ie. [0.111, 0.234, 0.114, 0.578]
    const sample = Math.random() // 0.4
    let total = 0
    for (let i = 0; i < normalized.length; i++) {
        total += normalized[i] // 0.
        if (sample < total) { // 0.4 < 0.111?
            return i
        }
    }
    return -1;
}

export const CosineSimilarity = (A: number[], B: number[]) => {
    var dotproduct = 0;
    var mA = 0;
    var mB = 0;
    for (let i = 0; i < A.length; i++) { // here you missed the i++
        dotproduct += (A[i] * B[i]);
        mA += (A[i] * A[i]);
        mB += (B[i] * B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct) / ((mA) * (mB)) // here you needed extra brackets
    return similarity;
}
