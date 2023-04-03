/**
 * The recommendation engine will be implemented as a stately class, that is constructed/initialized once at startup of the app, and kept alive in the background.
 */

import { IRecommendation } from "./IRecommendation";
import { IContext } from "./IContext";
import { IExercise, IExerciseData, IScoredExercise } from "./IExercise";
import { IOracleState } from "./IOracleState";
import { IEvaluation } from "./IEvaluation";

import { Oracle } from "../services/Oracle";


export type IRecommendationEngineState = {
  clickOracleState: IOracleState;
  ratingOracleState: IOracleState;
  softmaxBeta: number;
  ratingWeight: number;
  nRecommendations: number;
};

export interface IRecommendationEngine {
  clickOracle: Oracle;
  ratingOracle: Oracle;
  softmaxBeta: number;
  ratingWeight: number;
  nRecommendations: number;

  // static methods (including constructor) are not allowed in interfaces:
  // new (
  //   clickOracle: Oracle,
  //   ratingOracle: Oracle,
  //   exercises: IExerciseData,
  //   softmaxBeta: number,
  //   ratingWeight: number,
  //   nRecommendations: number,
  //   ) : IRecommendationEngineInstance;

  // fromRecommendationEngineState(state: IRecommendationEngineState, exercises: IExerciseData): void;
  
  getRecommendationEngineState(): IRecommendationEngineState;
  toJSON(): string;
  
  makeRecommendation(context: IContext): IRecommendation;
  scoreExercises(context: IContext): IScoredExercise[];
  getRecommendedExercises(recommendation: IRecommendation): IExercise[];

  onCloseRecommendations(recommendation: IRecommendation): Promise<void>;
  onChooseRecommendedExercise(recommendation: IRecommendation, exerciseId: string): Promise<void>;
  onEvaluateExercise(
    possibleRecommendationContext: null | IContext,
    evaluationTimeContext: IContext,
    exerciseId: string,
    evaluation: IEvaluation,
  ): Promise<void>;

  
}

// // Contextual information, provided by the app to the recommendation engine
// export type Context = {
//   datetime: string; // ISO datetime string
//   lastEma?: {
//     completedAt: string;
//     results: EmaResults;
//   };

//   // TODO: To be determined with EUR, what to include in here
//   // - time of day
//   // - is weekend or not
// };

// export type Recommendations = {
//   context: Context;

//   // The `probability` property is not for the UI: the array is already sorted from "best recommendation" to less good, and that's all the UI needs to know
//   recommendedExercises: Array<{
//     exerciseId: string;
//     probability: number; // not for the UI
//   }>;
// };

// export type EmaResults = {
//   completedAt: string; // ISO datetime string
//   feelings: {
//     sad: number; // 1 thru 5 incl.
//     stressed: number; // 1 thru 5 incl.
//     frustrated: number; // 1 thru 5 incl.
//     energetic: number; // 1 thru 5 incl.
//     happy: number; // 1 thru 5 incl.
//     relaxed: number; // 1 thru 5 incl.
//     fatigued: number; // 1 thru 5 incl.
//   };
// };

// // This is entirely up to the recommendation engine, but will probably include things like:
// // - weights
// // - features
// // - learning rate
// // - etc.
// export type RecommenderState = unknown;

// export type ExerciseInfo = {
//   id: string;
//   features: {
//     // TODO: To be determined with EUR, what to include here. It could be things like:
//     // - typical duration in minutes
//     // - tags, but, specifically listed again has our preference, instead of hard-coupling this with the exercises' tags. Which tags are relevant could be determined by the outcomes of the MRT study
//     // - approaches (using a separate boolean feature per approach)
//     // - "has been placed in the students' room"
//     // - "how many times completed within the app"
//     // - maybe also, "how many times completed outside of the app", note: this info is not available for group B
//     //
//     // Discussion points:
//     // - changing vs static features ("how many times completed in app" vs "is a mindfulness exercise")
//   };
// };

// export type ExerciseData = {
//   exercises: ExerciseInfo[];
// };

// export type EvaluationResults = {
//   liked: number; // 1 thru 100 incl.
//   helpful: number; // 1 thru 100 incl.
// };
