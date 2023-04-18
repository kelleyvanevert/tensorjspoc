import { IExercise, IScoredExercise } from "./interfaces/IExercise";
import { IContext, createDefaultContext } from "./interfaces/IContext";
import { IRecommendation, IRecommendedExercise } from "./interfaces/IRecommendation";
import { IExerciseData } from "./interfaces/IExercise";
import { IEvaluation, IExerciseTrainingData } from "./interfaces";
import { IRecommendationEngine, IDemoRecommendationEngine, IRecommendationEngineState } from "./interfaces/IRecommendationEngine";
import { 
    weightedHarmonicMean, 
    ConvertScoresToProbabilityDistribution, 
    SampleFromProbabilityDistribution 
} from "./MathService";
import { Oracle } from "./Oracle";


interface exerciseScore {
    exerciseId: string;
    score: number;
}

export class RecommendationEngine implements IRecommendationEngine {

    clickOracle: Oracle;
    likingOracle: Oracle;
    helpfulnessOracle: Oracle;
    exercises: Record<string, IExercise>;
    softmaxBeta: number;
    clickWeight: number;
    likingWeight: number;
    helpfulnessWeight: number;
    nRecommendations: number;


    constructor (
        clickOracle: Oracle,
        likingOracle: Oracle,
        helpfulnessOracle: Oracle,
        exercises: IExerciseData,
        softmaxBeta: number = 1,
        clickWeight: number = 0.7,
        likingWeight: number = 0.15,
        helpfulnessWeight: number = 0.15,
        nRecommendations: number = 3,
    ) {
        this.clickOracle = clickOracle;
        this.likingOracle = likingOracle;
        this.helpfulnessOracle = helpfulnessOracle;
        this.exercises = this.setExercises(exercises);
        this.softmaxBeta = softmaxBeta;
        this.clickWeight = clickWeight;
        this.likingWeight = likingWeight;
        this.helpfulnessWeight = helpfulnessWeight;
        this.nRecommendations = nRecommendations;
    }

    static fromJSON(json:string, exercises: IExerciseData): IRecommendationEngine {
        const state = JSON.parse(json) as IRecommendationEngineState; // @Oege: this might not work as simply as I put it here ...
        return RecommendationEngine.fromRecommendationEngineState(state, exercises);
    }

    static fromRecommendationEngineState(state: IRecommendationEngineState, exercises: IExerciseData): IRecommendationEngine {
        const clickOracle = Oracle.fromOracleState(state.clickOracleState);
        const likingOracle = Oracle.fromOracleState(state.likingOracleState);
        const helpfulnessOracle = Oracle.fromOracleState(state.helpfulnessOracleState);
        const softmaxBeta = state.softmaxBeta;
        const clickWeight = state.clickWeight;
        const likingWeight = state.likingWeight;
        const helpfulnessWeight = state.helpfulnessWeight;
        const nRecommendations = state.nRecommendations;
        return new RecommendationEngine(
            clickOracle,
            likingOracle,
            helpfulnessOracle,
            exercises,
            softmaxBeta,
            clickWeight,
            likingWeight,
            helpfulnessWeight,
            nRecommendations,
        );
    }

    getRecommendationEngineState() : IRecommendationEngineState {
        return {
            clickOracleState: this.clickOracle.getOracleState(),
            likingOracleState: this.likingOracle.getOracleState(),
            helpfulnessOracleState: this.helpfulnessOracle.getOracleState(),
            softmaxBeta: this.softmaxBeta,
            clickWeight: this.clickWeight,
            likingWeight: this.likingWeight,
            helpfulnessWeight: this.helpfulnessWeight,
            nRecommendations: this.nRecommendations,
        }
    }

    toJSON(): string {
        return JSON.stringify(this.getRecommendationEngineState());
    }

    setExercises(exercises: IExerciseData) {
        this.exercises = exercises.reduce((acc, obj) => {
            (acc as any)[obj.ExerciseId] = obj;
            return acc;
          }, {});
        return this.exercises;
    }

    private _sampleRecommendation(exerciseScores: exerciseScore[]):  number {
        const scores = exerciseScores.map(ex => ex.score);
        const probabilities = ConvertScoresToProbabilityDistribution(scores, this.softmaxBeta);
        const sampleIndex = SampleFromProbabilityDistribution(probabilities);
        return sampleIndex;
    }

    makeRecommendation(context: IContext) {
        let scoredExercises: IRecommendedExercise[] = [];

        for (const exerciseId in this.exercises) {
            const exercise = this.exercises[exerciseId];
            const clickScore = this.clickOracle.predict(context, exercise.Features, exercise.ExerciseId);
            const likingScore = this.likingOracle.predict(context, exercise.Features, exercise.ExerciseId);
            const helpfulnessScore = this.helpfulnessOracle.predict(context, exercise.Features, exercise.ExerciseId);
            const aggregateScore = weightedHarmonicMean(
                [clickScore, likingScore, helpfulnessScore], 
                [this.clickWeight, this.likingWeight, this.helpfulnessWeight]
            );
            const softmaxNumerator = Math.exp(this.softmaxBeta * aggregateScore)
            scoredExercises.push({
                exerciseId: exerciseId,
                score: aggregateScore,
                probability: softmaxNumerator,
            })
        }
        let SoftmaxDenominator = scoredExercises.reduce((a, b) => a + b.probability, 0);
        scoredExercises = scoredExercises.map(ex => ({
            exerciseId: ex.exerciseId,
            score: ex.score,
            probability: ex.probability / SoftmaxDenominator,
          }));
        let recommendedExercises: IRecommendedExercise[] = []
        for (let index = 0; index < this.nRecommendations; index++) {
            const sampleIndex = this._sampleRecommendation(scoredExercises);
            recommendedExercises[index] = scoredExercises[sampleIndex]
            scoredExercises.splice(sampleIndex, 1); 
        }
        const recommendation: IRecommendation = {
            context: context,
            recommendedExercises: recommendedExercises
        }
        return recommendation
    }

    private _generateDirectChoiceTrainingData(exerciseId: string): IExerciseTrainingData[] {
        const exercise = this.exercises[exerciseId];
        if (!exercise) {
            throw new Error(`Failed to generate training data for exercise with id ${exerciseId}.`);
        }
        const input = {
          exerciseId: exerciseId,
          contextFeatures: createDefaultContext(),
          exerciseFeatures: exercise.Features,
        };
        const clicked = 1;
        const liking = undefined;
        const helpfulness = undefined;
        const probability = undefined;
        return [{ input, clicked, liking, helpfulness, probability }];
    }

    private _generateClickTrainingData(recommendation: IRecommendation, selectedExerciseId:string|undefined=undefined) : IExerciseTrainingData[] {
        let trainingData: IExerciseTrainingData[] = []
        for (let index = 0; index < recommendation.recommendedExercises.length; index++) {
            const exerciseId = recommendation.recommendedExercises[index].exerciseId;
            const recommendedExercise = this.exercises[exerciseId];   
            if (!recommendedExercise) {
                throw new Error(`Failed to generate training data for recommended exercise at index ${index}.`);
            } 
            const input = {
              exerciseId: exerciseId,
              contextFeatures: recommendation.context,
              exerciseFeatures: recommendedExercise.Features,
            };
            
            const clicked = recommendedExercise.ExerciseId === selectedExerciseId ? 1 : 0;
            const liking = undefined;
            const helpfulness = undefined;
            const probability = recommendation.recommendedExercises[index].probability;
    
            trainingData.push({ input, clicked, liking, helpfulness, probability });
          }
          return trainingData
    }

    private _generateEvaluationTrainingData(context: IContext, exerciseId:string, evaluation:IEvaluation): IExerciseTrainingData { 
        const evaluatedExercise = this.exercises[exerciseId];   
        if (!evaluatedExercise) {
            throw new Error(`Failed to generate training data for evaluated exercise at index ${exerciseId}.`);
        } 
        const input = {
            exerciseId: exerciseId,
            contextFeatures: context,
            exerciseFeatures: evaluatedExercise.Features,
        };
        
        const clicked = undefined;
        const liking = evaluation.liked / 100;
        const helpfulness = evaluation.helpful / 100;
        const probability = 1;
        const trainingData: IExerciseTrainingData = { input, clicked, liking, helpfulness, probability };
        return trainingData;
    }

    onChooseExerciseDirectly(exerciseId:string): Promise<IExerciseTrainingData[]> {
        return new Promise((resolve, reject) => {
            try {
                const trainingData = this._generateDirectChoiceTrainingData(exerciseId);
                this.clickOracle.fitMany(trainingData);
                resolve(trainingData);
            } catch (error) {
                reject(error);
            }
        });
    }

    onCloseRecommendations(recommendation: IRecommendation): Promise<IExerciseTrainingData[]> {
        return new Promise((resolve, reject) => {
            try {
                const trainingData = this._generateClickTrainingData(recommendation);
                this.clickOracle.fitMany(trainingData);
                resolve(trainingData);
            } catch (error) {
                reject(error);
            }
        });
      }

    onChooseRecommendedExercise(
        recommendation: IRecommendation,
        exerciseId: string,
      ): Promise<IExerciseTrainingData[]>  {
        return new Promise((resolve, reject) => {
            try {
                const trainingData = this._generateClickTrainingData(recommendation, exerciseId);
                this.clickOracle.fitMany(trainingData);
                resolve(trainingData);
            } catch (error) {
                reject(error);
            }
      });
      }
    
    onEvaluateExercise(
        possibleRecommendationContext: null | IContext,
        evaluationTimeContext: IContext,
        exerciseId: string,
        evaluation: IEvaluation,
      ) : Promise<IExerciseTrainingData[]>  {
        return new Promise((resolve, reject) => {
            try {
                const context = possibleRecommendationContext ?? evaluationTimeContext;
                const trainingData = this._generateEvaluationTrainingData(context, exerciseId, evaluation);
                this.likingOracle.fit(trainingData);
                this.helpfulnessOracle.fit(trainingData);
                resolve([trainingData]);
            } catch (error) {
                reject(error);
            }
      });
    }

    fitOnTrainingData(trainingData: IExerciseTrainingData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.clickOracle.fitMany(trainingData);
                this.likingOracle.fitMany(trainingData);
                this.helpfulnessOracle.fitMany(trainingData);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
}

export class DemoRecommendationEngine extends RecommendationEngine implements IDemoRecommendationEngine {
    
    scoreAllExercises(context: IContext) : IScoredExercise[] {
        let scoredExercises: IScoredExercise[] = [];

        for (const exerciseId in this.exercises) {
            const exercise = this.exercises[exerciseId];
            const clickScore = this.clickOracle.predict(context, exercise.Features, exercise.ExerciseId);
            const likingScore = this.likingOracle.predict(context, exercise.Features, exercise.ExerciseId);
            const helpfulnessScore = this.helpfulnessOracle.predict(context, exercise.Features, exercise.ExerciseId);
            const aggregateScore = weightedHarmonicMean(
                [clickScore, likingScore, helpfulnessScore], [this.clickWeight, this.likingWeight, this.helpfulnessWeight]
            );
            const softmaxNumerator = Math.exp(this.softmaxBeta * aggregateScore)
            scoredExercises.push({
                ExerciseName: exercise.ExerciseName,
                ExerciseId: exerciseId,
                ClickScore: clickScore,
                LikingScore: likingScore,
                HelpfulnessScore: helpfulnessScore,
                AggregateScore: aggregateScore,
                Probability: softmaxNumerator,
                SelectedCount: exercise.SelectedCount,
            })
        }
        let SoftmaxDenominator = scoredExercises.reduce((a, b) => a + b.Probability, 0);
        scoredExercises = scoredExercises.map(ex => ({...ex, ...{Probability: ex.Probability / SoftmaxDenominator}}))
        const sortedExercises = scoredExercises.sort((a, b) => b.AggregateScore - a.AggregateScore);
        return sortedExercises;
    }

    getRecommendedExercises(recommendation: IRecommendation) : IExercise[] {
        return recommendation.recommendedExercises.map(ex => this.exercises[ex.exerciseId]);
    }
  }