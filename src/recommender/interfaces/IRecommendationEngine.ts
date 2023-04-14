import {IRecommendation} from './IRecommendation';
import {IContext} from './IContext';
import {INeeds} from './INeeds';
import {IExercise, IExerciseData, IScoredExercise} from './IExercise';
import { IExerciseTrainingData } from './ITrainingData';
import {IOracleState} from './IOracleState';
import {IEvaluation} from './IEvaluation';
import {RecommendationEngine} from '../RecommendationEngine';
import {Oracle} from '../Oracle';
import {DefaultRecommendationEngine} from '../Defaults';

export type IRecommendationEngineState = {
  clickOracleState: IOracleState;
  likingOracleState: IOracleState;
  helpfulnessOracleState: IOracleState;
  softmaxBeta: number;
  clickWeight: number;
  likingWeight: number;
  helpfulnessWeight: number;
  nRecommendations: number;
};


export function createEngineWithDefaults(
  exercises: IExerciseData,
): IRecommendationEngine {
  return RecommendationEngine.fromRecommendationEngineState(DefaultRecommendationEngine, exercises);
}

export function createEngineForNeeds(
  exercises: IExerciseData,
  needs: INeeds,
): IRecommendationEngine {
  return RecommendationEngine.fromRecommendationEngineState(DefaultRecommendationEngine, exercises);
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
  
  onCloseRecommendations(recommendation: IRecommendation): Promise<IExerciseTrainingData[]>;
  onChooseRecommendedExercise(
    recommendation: IRecommendation,
    exerciseId: string,
  ): Promise<IExerciseTrainingData[]>;
  onEvaluateExercise(
    possibleRecommendationContext: null | IContext,
    evaluationTimeContext: IContext,
    exerciseId: string,
    evaluation: IEvaluation,
  ): Promise<IExerciseTrainingData[]>;
}


export interface IDemoRecommendationEngine extends IRecommendationEngine {
  // in the demo we need more access to the internals of the engine and its oracles
  // so we expose them here

  clickOracle: Oracle;
  likingOracle: Oracle;
  helpfulnessOracle: Oracle;
  softmaxBeta: number;
  clickWeight: number;
  likingWeight: number;
  helpfulnessWeight: number;
  nRecommendations: number;

  // we also want to display all exercises with their scores
  scoreAllExercises(context: IContext): IScoredExercise[];

  // and easily retrieve the recomended exercises inside the recommendation
  getRecommendedExercises(recommendation: IRecommendation): IExercise[];

}
