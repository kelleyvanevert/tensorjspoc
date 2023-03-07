import { IExcerciseFeatures } from "./IExerciseFeatures";

export interface TrainingData {
    input: IExcerciseFeatures;
    output: {
        score: number;
    };
}
