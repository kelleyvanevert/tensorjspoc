import { IExerciseFeatures } from "./IExerciseFeatures";
import { IContext } from "./IContext";

export interface ITrainingData {
    input: {
        exerciseName: string;
        contextFeatures: IContext;
        exerciseFeatures: IExerciseFeatures;
    }
    clicked: number;
    rating: number | undefined;
    probability : number | undefined;
}
