import { IExerciseFeatures } from "./IExerciseFeatures";
import { IContext } from "./IContext";

export interface ITrainingData {
    input: {
        exerciseId?: string | undefined;
        contextFeatures?: Record<string, number> | undefined;
        exerciseFeatures?: Record<string, number> | undefined;
    }
    label?: number | undefined;
    probability?: number | undefined;
}

export interface IExerciseTrainingData extends ITrainingData{
    input: {
        exerciseId: string;
        contextFeatures: IContext;
        exerciseFeatures: IExerciseFeatures;
    }
    clicked: number | undefined;
    liking: number | undefined;
    probability : number | undefined;
}
