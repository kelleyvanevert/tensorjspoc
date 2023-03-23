import { IContext, IExcercise, ITrainingData } from '../interfaces';
import { LogisticOracle } from './LogisticOracle';
import { getSoftmaxSample, getCosineDistance } from './Sampling'


function weightedHarmonicMean(numbers: number[], weights: number[]): number {
    if (numbers.length !== weights.length) {
      throw new Error("The length of numbers array and weights array must be the same.");
    }
    let sumWeightedValues = 0;
    let sumWeights = 0;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] === 0) {
        throw new Error("Cannot calculate harmonic mean when a value in the numbers array is zero.");
      }
      sumWeightedValues += weights[i] / numbers[i];
      sumWeights += weights[i];
    }
    return sumWeights / sumWeightedValues;
  }

function calculateScore(exercise: IExcercise, ratingWeight: number = 0.5) {
    if ((exercise.ClickScore == undefined) && (exercise.RatingScore != undefined)) {    
        return exercise.RatingScore;
    } else if ((exercise.ClickScore != undefined) && (exercise.RatingScore == undefined)) { 
        return exercise.ClickScore;
    } else if ((exercise.ClickScore == undefined) && (exercise.RatingScore == undefined)) { 
        return 0;
    }  else {
        return weightedHarmonicMean(
            [exercise.ClickScore, exercise.RatingScore], 
            [1-ratingWeight, ratingWeight]
        );
    }
}

export function calculateScoresAndSortExercises(
    clickOracle: LogisticOracle,
    ratingOracle: LogisticOracle,
    context: IContext, 
    exercises: IExcercise[], 
    softmaxBeta: number,
    ratingWeight: number = 0.5,
    ) :IExcercise[] {
    let sortedExercises: IExcercise[] = [];
    let SoftmaxNumerators = []
    for (let index = 0; index < exercises.length; index++) {
        const exercise = exercises[index];
        exercise.ClickScore = clickOracle.predictProba(context, exercise.Features, exercise.InternalName);
        exercise.RatingScore = ratingOracle.predictProba(context, exercise.Features, exercise.InternalName);
        exercise.AggregateScore = calculateScore(exercise, ratingWeight);
        SoftmaxNumerators.push(Math.exp(softmaxBeta * (exercise.AggregateScore || 0)));
        sortedExercises.push(exercise)
    }
    let SoftmaxDenominator = SoftmaxNumerators.reduce((a, b) => a + b, 0);
    for (let index = 0; index < sortedExercises.length; index++) {
        const exercise = sortedExercises[index];
        exercise.Probability = SoftmaxNumerators[index] / SoftmaxDenominator;
    }

    sortedExercises = sortedExercises.sort((a, b) => (b.AggregateScore || 0) - (a.AggregateScore || 0));
    
    console.log("theta -> ", clickOracle.getThetaMap())
    return sortedExercises;
}

export function sampleRecommendedExercises(
    exercises: IExcercise[],
    softmaxBeta: number,
) : IExcercise[]
{
    const exercisesCopy = exercises.slice()
    let recommendedExercises: IExcercise[] = []
    for (let index = 0; index < 3; index++) {
        const sample = getSoftmaxSample(exercisesCopy, softmaxBeta);
        recommendedExercises[index] = sample.exercise; // set i-th recommendation
        
        exercisesCopy.splice(sample.index, 1); // remove the recent recommended item

        // const distance = getCosineDistance(exercisesCopy, sample.exercise); // calculate distance between curr and all "remaining" exercises
        // const mostSimilarItemToSelectedExercise = distance[distance.length - 1]
        // // console.log("Sample -> ", sample.exercise.DisplayName, "\nRemoved Similar -> ", mostSimilarItemToSelectedExercise.exercise.InternalName)
        // let indexToRemove = exercisesCopy.findIndex(s => s.InternalName == mostSimilarItemToSelectedExercise.exercise.InternalName)
        // exercisesCopy.splice(indexToRemove, 1)
        // remove the last selected value and shrink size by 1
    }
    return recommendedExercises
}

export function generateOracleTrainingData(
    recommendedExercises: IExcercise[],
    selected: IExcercise | undefined,
    context: IContext,
    starRating: number | undefined,
    ) : ITrainingData[] {
    let trainingData: ITrainingData[] = []
    // console.log("generateOracleTrainingData", recommendedExercises, selected, context, starRating)
    for (let index = 0; index < recommendedExercises.length; index++) {
        trainingData.push({
            input: {
                exerciseName: recommendedExercises[index].InternalName,
                contextFeatures: context,
                exerciseFeatures: recommendedExercises[index].Features,
            },
            clicked: recommendedExercises[index].InternalName == selected?.InternalName ? 1 : 0,
            stars: (
                recommendedExercises[index].InternalName == selected?.InternalName ? 
                ((starRating == undefined) ? starRating : starRating / 5) : undefined
            ),
            probability: recommendedExercises[index].Probability,
        })
    }
    return trainingData;
}


