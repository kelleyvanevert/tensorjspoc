import {IRecommendation} from './IRecommendation';
import {IContext} from './IContext';
import {IExercise, IExerciseData, IScoredExercise} from './IExercise';
import {IOracleState} from './IOracleState';
import {IEvaluation} from './IEvaluation';
import {RecommendationEngine} from '../services/RecommendationEngine';
import {Oracle} from '../services/Oracle';

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

  getRecommendationEngineState(): IRecommendationEngineState;
  toJSON(): string;

  makeRecommendation(context: IContext): IRecommendation;
  
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


export interface IDemoRecommendationEngine extends IRecommendationEngine {
  // in the demo we need more access to the internals of the engine and its oracles
  // so we expose them here

  clickOracle: Oracle;
  ratingOracle: Oracle;
  softmaxBeta: number;
  ratingWeight: number;
  nRecommendations: number;

  // we also want to display all exercises with their scores
  scoreAllExercises(context: IContext): IScoredExercise[];

  // and retrieve the recomended exercises inside the recommendation
  getRecommendedExercises(recommendation: IRecommendation): IExercise[];

}
