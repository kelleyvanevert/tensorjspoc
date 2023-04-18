import {IRecommendation} from './IRecommendation';
import {IContext} from './IContext';
import {INeeds} from './INeeds';
import { IDemographics } from './IDemographics';
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
  initialTrainingData: IExerciseTrainingData[] = [],
): IRecommendationEngine {
  const engine = RecommendationEngine.fromRecommendationEngineState(DefaultRecommendationEngine, exercises);
  engine.fitOnTrainingData(initialTrainingData);
  return engine;
}

export function createEngineForDemographicsAndNeeds(
  exercises: IExerciseData,
  demographics: IDemographics,
  needs: INeeds,
  initialTrainingData: IExerciseTrainingData[] = [],
): IRecommendationEngine {
  const engine = RecommendationEngine.fromRecommendationEngineState(DefaultRecommendationEngine, exercises);
  engine.fitOnTrainingData(initialTrainingData);
  return engine;
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
  
  onChooseExerciseDirectly(exerciseId:string): Promise<IExerciseTrainingData[]>;
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

  fitOnTrainingData(trainingData: IExerciseTrainingData[]): Promise<void>;
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
