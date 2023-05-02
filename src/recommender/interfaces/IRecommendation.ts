import { IProcessedContext } from "./IContext";

export interface IRecommendedExercise {
  exerciseId: string,
  score: number,
  probability: number,
}


export interface IRecommendation {
    context: IProcessedContext;
    recommendedExercises: Array<IRecommendedExercise>;
  };