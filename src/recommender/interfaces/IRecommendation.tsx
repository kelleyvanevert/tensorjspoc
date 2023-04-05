import { IContext } from "./IContext";

export interface IRecommendedExercise {
  exerciseId: string,
  score: number,
  probability: number,
}


export interface IRecommendation {
    context: IContext;
    recommendedExercises: Array<IRecommendedExercise>;
  };