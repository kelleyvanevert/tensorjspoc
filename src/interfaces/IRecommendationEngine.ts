import {IRecommendation} from './IRecommendation';
import {IContext} from './IContext';
import {IExercise, IExerciseData, IScoredExercise} from './IExercise';
import {IOracleState} from './IOracleState';
import {IEvaluation} from './IEvaluation';
import {RecommendationEngine} from '../services/RecommendationEngine';

/** @Oege this is a type, not an interface */
export type IRecommendationEngineState = {
  clickOracleState: IOracleState;
  ratingOracleState: IOracleState;
  softmaxBeta: number;
  ratingWeight: number;
  nRecommendations: number;
};

export function createEngineWithDefaults(
  exercises: IExerciseData,
): IRecommendationEngine {
  return RecommendationEngine.createNew(exercises);
}

export function createEngineFromJSON(
  json: string,
  exercises: IExerciseData,
): IRecommendationEngine {
  return RecommendationEngine.fromJSON(json, exercises);
}

export interface IRecommendationEngine {
  // @Oege these are not part of the interface!

  // clickOracle: Oracle;
  // ratingOracle: Oracle;
  // softmaxBeta: number;
  // ratingWeight: number;
  // nRecommendations: number;

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
  onChooseRecommendedExercise(
    recommendation: IRecommendation,
    exerciseId: string,
  ): Promise<void>;
  onEvaluateExercise(
    possibleRecommendationContext: null | IContext,
    evaluationTimeContext: IContext,
    exerciseId: string,
    evaluation: IEvaluation,
  ): Promise<void>;
}
