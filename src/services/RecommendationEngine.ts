import { IExercise } from "../interfaces/IExercise";
import { IContext } from "../interfaces/IContext";
import { IRecommendation, IRecommendedExercise } from "../interfaces/IRecommendation";
import { IExerciseData } from "../interfaces/IExercise";
import { IEvaluation } from "../interfaces/IEvaluation";
import { ITrainingData } from "../interfaces/ITrainingData";
import { IRecommendationEngine, IRecommendationEngineState } from "../interfaces/IRecommendationEngine";
import { Oracle } from "./Oracle";


import { weightedHarmonicMean, ConvertScoresToProbabilityDistribution, SampleFromProbabilityDistribution } from "./MathService";


export class RecommendationEngine implements IRecommendationEngine {

    clickOracle: Oracle;
    ratingOracle: Oracle;
    exercises: Record<string, IExercise>;
    softmaxBeta: number;
    ratingWeight: number;
    nRecommendations: number;


    constructor (
        clickOracle: Oracle,
        ratingOracle: Oracle,
        exercises: IExerciseData,
        softmaxBeta: number = 1,
        ratingWeight: number = 0.5,
        nRecommendations: number = 3,
    ) {
        this.clickOracle = clickOracle;
        this.ratingOracle = ratingOracle;
        this.exercises = this.setExercises(exercises);
        this.softmaxBeta = softmaxBeta;
        this.ratingWeight = ratingWeight;
        this.nRecommendations = nRecommendations;
    }

    static fromRecommendationEngineState(state: IRecommendationEngineState, exercises: IExerciseData): IRecommendationEngine {
        const clickOracle = Oracle.fromOracleState(state.clickOracleState);
        const ratingOracle = Oracle.fromOracleState(state.ratingOracleState);
        const softmaxBeta = state.softmaxBeta;
        const ratingWeight = state.ratingWeight;
        const nRecommendations = state.nRecommendations;
        return new RecommendationEngine(
            clickOracle,
            ratingOracle,
            exercises,
            softmaxBeta,
            ratingWeight,
            nRecommendations,
        );
    }

    getRecommendationEngineState() : IRecommendationEngineState {
        return {
            clickOracleState: this.clickOracle.getOracleState(),
            ratingOracleState: this.ratingOracle.getOracleState(),
            softmaxBeta: this.softmaxBeta,
            ratingWeight: this.ratingWeight,
            nRecommendations: this.nRecommendations,
        }
    }

    setExercises(exercises: IExerciseData) {
        this.exercises = exercises.reduce((acc, obj) => {
            (acc as any)[obj.InternalName] = obj;
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
            const clickScore = this.clickOracle.predictProba(context, exercise.Features, exercise.InternalName);
            const ratingScore = this.ratingOracle.predictProba(context, exercise.Features, exercise.InternalName);
            const aggregateScore = weightedHarmonicMean(
                [clickScore, ratingScore], [1-this.ratingWeight, this.ratingWeight]
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

    private _generateClickTrainingData(recommendation: IRecommendation, selectedExerciseId:string|undefined=undefined) : ITrainingData[] {
        let trainingData: ITrainingData[] = []
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
            const clicked = recommendedExercise.InternalName === selectedExerciseId ? 1 : 0;
            const rating = undefined;
            const probability = recommendation.recommendedExercises[index].probability;
    
            trainingData.push({ input, clicked, rating, probability });
          }
          return trainingData
    }

    private _generateEvaluationTrainingData(context: IContext, exerciseId:string, evaluation:IEvaluation): ITrainingData { 
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
        const rating = evaluation.liked / 100;
        const probability = 1;
        const trainingData: ITrainingData = { input, clicked, rating, probability };
        return trainingData;
    }

    onCloseRecommendations(recommendation: IRecommendation): void {
        const trainingData = this._generateClickTrainingData(recommendation);
        this.clickOracle.fitMany(trainingData);
    }

    onChooseRecommendedExercise(
        recommendation: IRecommendation,
        exerciseId: string,
      ): void {
        const trainingData = this._generateClickTrainingData(recommendation, exerciseId);
        this.clickOracle.fitMany(trainingData)
      }
    
    onEvaluateExercise(
        possibleRecommendationContext: null | IContext,
        evaluationTimeContext: IContext,
        exerciseId: string,
        evaluation: IEvaluation,
      ) : void {
        const context = possibleRecommendationContext ?? evaluationTimeContext;
        const trainingData = this._generateEvaluationTrainingData(context, exerciseId, evaluation);
        this.ratingOracle.fit(trainingData);
      }
    
}