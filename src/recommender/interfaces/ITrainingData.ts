import { IExerciseFeatures } from "./IExerciseFeatures";
import { IProcessedContext } from "./IContext";

export interface ITrainingData {
    input: {
        exerciseId?: string | undefined;
        contextFeatures?: Record<string, number | undefined> | undefined;
        exerciseFeatures?: Record<string, number | undefined> | undefined;
    }
    label?: number | undefined;
    probability?: number | undefined;
}

export interface IExerciseTrainingData extends ITrainingData{
    input: {
        exerciseId: string;
        contextFeatures: IProcessedContext;
        exerciseFeatures: IExerciseFeatures;
    }
    clicked: number | undefined;
    liking: number | undefined;
    helpfulness: number | undefined;
    probability : number | undefined;
}
