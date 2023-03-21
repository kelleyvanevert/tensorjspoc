import { IExcerciseFeatures } from "./IExerciseFeatures";
import { IContext } from "./IContext";

export interface ITrainingData {
    input: {
        exerciseName: string;
        contextFeatures: IContext;
        exerciseFeatures: IExcerciseFeatures;
        starRating: number;
    }
    label: number;
    probability : number | undefined;
}
