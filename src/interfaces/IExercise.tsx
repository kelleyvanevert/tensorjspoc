import { IExerciseFeatures } from './IExerciseFeatures';

export interface IExercise {
    DisplayName: string;
    InternalName: string;
    Features: IExerciseFeatures;
    SelectedCount?: number;
    ClickScore?: number | undefined;
    RatingScore?: number | undefined;
    AggregateScore?: number | undefined;
    Probability?: number | undefined;
}

export type IExerciseData = IExercise[];
