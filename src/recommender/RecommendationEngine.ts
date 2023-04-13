import { IExercise, IScoredExercise } from "./interfaces/IExercise";
import { IContext } from "./interfaces/IContext";
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
    exercises: Record<string, IExercise>;
    softmaxBeta: number;
    likingWeight: number;
    nRecommendations: number;


    constructor (
        clickOracle: Oracle,
        likingOracle: Oracle,
        exercises: IExerciseData,
        softmaxBeta: number = 1,
        likingWeight: number = 0.5,
        nRecommendations: number = 3,
    ) {
        this.clickOracle = clickOracle;
        this.likingOracle = likingOracle;
        this.exercises = this.setExercises(exercises);
        this.softmaxBeta = softmaxBeta;
        this.likingWeight = likingWeight;
        this.nRecommendations = nRecommendations;
    }

    static fromJSON(json:string, exercises: IExerciseData): IRecommendationEngine {
        const state = JSON.parse(json) as IRecommendationEngineState; // @Oege: this might not work as simply as I put it here ...
        return RecommendationEngine.fromRecommendationEngineState(state, exercises);
    }

    static fromRecommendationEngineState(state: IRecommendationEngineState, exercises: IExerciseData): IRecommendationEngine {
        const clickOracle = Oracle.fromOracleState(state.clickOracleState);
        const likingOracle = Oracle.fromOracleState(state.likingOracleState);
        const softmaxBeta = state.softmaxBeta;
        const likingWeight = state.likingWeight;
        const nRecommendations = state.nRecommendations;
        return new RecommendationEngine(
            clickOracle,
            likingOracle,
            exercises,
            softmaxBeta,
            likingWeight,
            nRecommendations,
        );
    }

    getRecommendationEngineState() : IRecommendationEngineState {
        return {
            clickOracleState: this.clickOracle.getOracleState(),
            likingOracleState: this.likingOracle.getOracleState(),
            softmaxBeta: this.softmaxBeta,
            likingWeight: this.likingWeight,
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
            const aggregateScore = weightedHarmonicMean(
                [clickScore, likingScore], [1-this.likingWeight, this.likingWeight]
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
            console.log("clicked", clicked, recommendedExercise.ExerciseId, selectedExerciseId)
            const liking = undefined;
            const probability = recommendation.recommendedExercises[index].probability;
    
            trainingData.push({ input, clicked, liking, probability });
          }
          console.log("_generateClickTrainingData", JSON.stringify(trainingData))
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
        const probability = 1;
        const trainingData: IExerciseTrainingData = { input, clicked, liking, probability };
        return trainingData;
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
                resolve([trainingData]);
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
            const aggregateScore = weightedHarmonicMean(
                [clickScore, likingScore], [1-this.likingWeight, this.likingWeight]
            );
            const softmaxNumerator = Math.exp(this.softmaxBeta * aggregateScore)
            scoredExercises.push({
                ExerciseName: exercise.ExerciseName,
                ExerciseId: exerciseId,
                ClickScore: clickScore,
                LikingScore: likingScore,
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