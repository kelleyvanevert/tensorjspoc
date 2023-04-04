import { IRecommendation } from "./IRecommendation";
import { IContext } from "./IContext";
import { IExercise, IScoredExercise } from "./IExercise";
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
  scoreAllExercises(context: IContext): IScoredExercise[];
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