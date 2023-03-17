import { IExcerciseFeatures } from './IExerciseFeatures';

export interface IExcercise {
    DisplayName: string;
    InternalName: string;
    Features: IExcerciseFeatures;
    Score: number | undefined;
    // SoftmaxNumerator: number | undefined;
    Probability: number | undefined;
    PenalizedScore: number | undefined;
    PenalizedProbability: number | undefined;
}
