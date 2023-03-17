import { IExcerciseFeatures } from "./IExerciseFeatures";
import { IContext } from "./IContext";

export interface ITrainingData {
    input: {
        contextFeatures: IContext;
        exerciseFeatures: IExcerciseFeatures;
    }
    output: {
        score: number;
    };
    probability : number | undefined;
}
