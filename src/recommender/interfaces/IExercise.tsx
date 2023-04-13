import { IExerciseFeatures } from './IExerciseFeatures';

export interface IExercise {
    ExerciseName: string;
    ExerciseId: string;
    Features: IExerciseFeatures;
    SelectedCount?: number;
}

export interface IScoredExercise {
    ExerciseName: string;
    ExerciseId: string;
    ClickScore: number
    LikingScore: number;
    AggregateScore: number;
    Probability: number;
    SelectedCount?: number;
}

export type IExerciseData = IExercise[];
