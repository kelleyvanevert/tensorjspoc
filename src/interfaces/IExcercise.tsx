import { IExcerciseFeatures } from './IExerciseFeatures';

export interface IExcercise {
    DisplayName: string;
    InternalName: string;
    Features: IExcerciseFeatures;
    SelectedCount?: number;
    ClickScore?: number | undefined;
    RatingScore?: number | undefined;
    AggregateScore?: number | undefined;
    Probability?: number | undefined;
}
