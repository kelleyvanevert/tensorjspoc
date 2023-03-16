import { IExcerciseFeatures } from './IExerciseFeatures';

export interface IExcercise {
    DisplayName: string;
    InternalName: string;
    Value: IExcerciseFeatures;
    Score: number | undefined;
    SoftmaxNumerator: number | undefined;
    Probability: number | undefined;
}
