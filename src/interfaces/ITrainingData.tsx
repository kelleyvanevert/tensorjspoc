import { IExcerciseFeatures } from "./IExerciseFeatures";

export interface ITrainingData {
    input: IExcerciseFeatures;
    output: {
        score: number;
    };
}
