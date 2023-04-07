import {
  weightedHarmonicMean,
  ConvertScoresToProbabilityDistribution,
  SampleFromProbabilityDistribution,
  CosineSimilarity,
} from '../MathService';

describe('weightedHarmonicMean', () => {
  it('should calculate the weighted harmonic mean correctly', () => {
    const numbers = [2, 3, 4];
    const weights = [1, 2, 3];
    const expectedWeightedHarmonicMean = 3.13;
    expect(weightedHarmonicMean(numbers, weights)).toBeCloseTo(
      expectedWeightedHarmonicMean,
      3,
    );
  });

  it('should throw an error when the length of numbers and weights arrays is not the same', () => {
    const numbers = [2, 3, 4];
    const weights = [1, 2];
    expect(() => weightedHarmonicMean(numbers, weights)).toThrowError(
      'The length of numbers array and weights array must be the same.',
    );
  });

  it('should throw an error when a value in the numbers array is zero', () => {
    const numbers = [2, 0, 4];
    const weights = [1, 2, 3];
    expect(() => weightedHarmonicMean(numbers, weights)).toThrowError(
      'Cannot calculate harmonic mean when a value in the numbers array is zero.',
    );
  });
});

describe('ConvertScoresToProbabilityDistribution', () => {
  it('should correctly calculate probabilities with positive scores', () => {
    const scores = [0.2, 0.6, 0.8];
    const softmaxBeta = 1;
    const expectedProbabilities = [0.2318, 0.3458, 0.4223];
    const result = ConvertScoresToProbabilityDistribution(scores, softmaxBeta);
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(expectedProbabilities[i], 3);
    }
  });

  it('should correctly calculate probabilities with negative scores', () => {
    const scores = [-1, -3, -5];
    const softmaxBeta = 1;
    const expectedProbabilities = [0.8668, 0.1173, 0.0158];
    const result = ConvertScoresToProbabilityDistribution(scores, softmaxBeta);
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(expectedProbabilities[i], 3);
    }
  });

  it('should correctly calculate probabilities with mixed scores', () => {
    const scores = [1, -2, 3];
    const softmaxBeta = 2;
    const expectedProbabilities = [0.0179, 0.0, 0.9819];
    const result = ConvertScoresToProbabilityDistribution(scores, softmaxBeta);
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(expectedProbabilities[i], 3);
    }
  });

  it('should throw an error when softmaxBeta is 0', () => {
    const scores = [1, 2, 3];
    const softmaxBeta = 0;
    expect(() => {
      ConvertScoresToProbabilityDistribution(scores, softmaxBeta);
    }).toThrowError('softmaxBeta must be greater than zero');
  });

  it('should throw an error when scores array is empty', () => {
    const scores: number[] = [];
    const softmaxBeta = 1;
    expect(() => {
      ConvertScoresToProbabilityDistribution(scores, softmaxBeta);
    }).toThrowError('scores array must not be empty');
  });
});

describe('CosineSimilarity', () => {
  it('should return 1 for two identical vectors', () => {
    const A = [1, 2, 3];
    expect(CosineSimilarity(A, A)).toBe(1);
  });

  it('should return -1 for two vectors pointing in opposite directions', () => {
    const A = [1, 2, 3];
    const B = [-1, -2, -3];
    expect(CosineSimilarity(A, B)).toBe(-1);
  });

  it('should return 0 for two orthogonal vectors', () => {
    const A = [1, 0, 0];
    const B = [0, 1, 0];
    expect(CosineSimilarity(A, B)).toBeCloseTo(0, 6);
  });

  it('should return a value between -1 and 1 for two random vectors', () => {
    const A = [1, 2, 3, 4];
    const B = [5, 6, 7, 8];
    const similarity = CosineSimilarity(A, B);
    expect(similarity).toBeGreaterThanOrEqual(-1);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should throw an error if A and B have different lengths', () => {
    const A = [1, 2, 3];
    const B = [4, 5];
    expect(() => CosineSimilarity(A, B)).toThrow(
      'Arrays must have the same length',
    );
  });

  it('should return 0 if A and B are empty arrays', () => {
    const A: number[] = [];
    const B: number[] = [];
    expect(CosineSimilarity(A, B)).toBeCloseTo(0, 6);
  });
});
