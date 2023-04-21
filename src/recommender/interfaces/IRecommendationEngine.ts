import {IRecommendation} from './IRecommendation';
import {IContext, IProcessedContext} from './IContext';
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
  engine.clickOracle.updateWeights({
    "be_more_present": needs.beMorePresent ? 1.0 : 0.0 ,
    "relax": needs.relax ? 1.0 : 0.0 ,
    "be_kinder_to_myself" : needs.beKinderToMyself ? 1.0 : 0.0 ,
    "increase_positive_feelings"  : needs.increasePositiveFeelings ? 1.0 : 0.0 ,
    "manage_difficult_thoughts_and_feelings"  : needs.managedifficultThoughtsAndFeelings ? 1.0 : 0.0 ,
    "focus_on_what_matters_to_me"   :needs.focusOnWhatMattersToMe ? 1.0 : 0.0 ,
  })

  engine.likingOracle.updateWeights({
    "be_more_present": needs.beMorePresent ? 1.0 : 0.0 ,
    "relax": needs.relax ? 1.0 : 0.0 ,
    "be_kinder_to_myself" : needs.beKinderToMyself ? 1.0 : 0.0 ,
    "increase_positive_feelings"  : needs.increasePositiveFeelings ? 1.0 : 0.0 ,
    "manage_difficult_thoughts_and_feelings"  : needs.managedifficultThoughtsAndFeelings ? 1.0 : 0.0 ,
    "focus_on_what_matters_to_me"   :needs.focusOnWhatMattersToMe ? 1.0 : 0.0 ,
  })

  engine.helpfulnessOracle.updateWeights({
    "be_more_present": needs.beMorePresent ? 1.0 : 0.0 ,
    "relax": needs.relax ? 1.0 : 0.0 ,
    "be_kinder_to_myself" : needs.beKinderToMyself ? 1.0 : 0.0 ,
    "increase_positive_feelings"  : needs.increasePositiveFeelings ? 1.0 : 0.0 ,
    "manage_difficult_thoughts_and_feelings"  : needs.managedifficultThoughtsAndFeelings ? 1.0 : 0.0 ,
    "focus_on_what_matters_to_me"   :needs.focusOnWhatMattersToMe ? 1.0 : 0.0 ,
  })

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

  // oracles are exposed so can adjust weights in createEngineForDemographicsAndNeeds
  clickOracle: Oracle;
  likingOracle: Oracle;
  helpfulnessOracle: Oracle;

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
    possibleRecommendationContext: null | IProcessedContext,
    evaluationTimeContext: IContext,
    exerciseId: string,
    evaluation: IEvaluation,
  ): Promise<IExerciseTrainingData[]>;

  fitOnTrainingData(trainingData: IExerciseTrainingData[]): Promise<void>;
}


export interface IDemoRecommendationEngine extends IRecommendationEngine {
  // in the demo we need more access to the internals of the engine and its oracles
  // so we expose them here

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
