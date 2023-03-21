import { IExcerciseFeatures } from './IExerciseFeatures';

export interface IExcercise {
    DisplayName: string;
    InternalName: string;
    Features: IExcerciseFeatures;
    SelectedCount?: number;
    Score?: number | undefined;
    Probability?: number | undefined;
    PenalizedScore?: number | undefined;
    PenalizedProbability?: number | undefined;
}
