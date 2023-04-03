import { IExerciseFeatures } from "./IExerciseFeatures";
import { IContext } from "./IContext";

export interface ITrainingData {
    input: {
        exerciseId: string;
        contextFeatures: IContext;
        exerciseFeatures: IExerciseFeatures;
    }
    clicked: number | undefined;
    rating: number | undefined;
    probability : number | undefined;
}
