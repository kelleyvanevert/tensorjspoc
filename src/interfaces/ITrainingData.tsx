import { IExcerciseFeatures } from "./IExerciseFeatures";
import { IContext } from "./IContext";

export interface ITrainingData {
    input: {
        exerciseName: string;
        contextFeatures: IContext;
        exerciseFeatures: IExcerciseFeatures;
    }
    clicked: number;
    stars: number | undefined;
    probability : number | undefined;
}
