import { IContext, IExcercise, ITrainingData } from '../interfaces';
import { LogisticOracle } from './LogisticOracle';
import { 
    weightedHarmonicMean, 
    ConvertScoresToProbabilityDistribution, 
    SampleFromProbabilityDistribution,
    CosineSimilarity,
} from './MathService';


export function calculateAggregateScore(exercise: IExcercise, ratingWeight: number = 0.5) {
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

export const CastOrderedFeatureToNumArray = (exercise_feature: IExcerciseFeatures): number[] => {
    const result: number[] = [];
    const features = Object.keys(exercise_feature);
    features.sort((a: string, b: string) => (a.localeCompare(b)))
    for (let index = 0; index < features.length; index++) {
        const element = features[index];
        result.push(exercise_feature[element as keyof typeof exercise_feature]);
    }
    return result
}

export function getCosineDistance (exercises:IExcercise[], exercise: IExcercise
    ): { exercise: IExcercise, distance: number }[] {
    let result: { exercise: IExcercise, distance: number }[] = []
    let current_ex_value = CastOrderedFeatureToNumArray(exercise.Features)
    exercises.forEach((ex) => {
        const ex_value = CastOrderedFeatureToNumArray(ex.Features)
        const distance = CosineSimilarity(current_ex_value, ex_value)
        result.push({
            exercise: ex,
            distance: distance
        })
    })

    result.sort((a, b) => (a.distance - b.distance));
    return result
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
        exercise.AggregateScore = calculateAggregateScore(exercise, ratingWeight);
        SoftmaxNumerators.push(Math.exp(softmaxBeta * (exercise.AggregateScore || 0)));
        sortedExercises.push(exercise)
    }
    let SoftmaxDenominator = SoftmaxNumerators.reduce((a, b) => a + b, 0);
    for (let index = 0; index < sortedExercises.length; index++) {
        const exercise = sortedExercises[index];
        exercise.Probability = SoftmaxNumerators[index] / SoftmaxDenominator;
    }

    sortedExercises = sortedExercises.sort((a, b) => (b.AggregateScore || 0) - (a.AggregateScore || 0));
    
    console.log("weights -> ", clickOracle.getWeightsMap())
    return sortedExercises;
}


export function sampleExercise(
    exercises: IExcercise[], 
    softmaxBeta: number = 2,
 ) : {exercise: IExcercise, index: number} {
    const scores = exercises.map(exercise => exercise.AggregateScore);
    if (scores == undefined) {
        throw "Fatal error. Scores was undefined while computing recommendation."
    }
    const probabilities = ConvertScoresToProbabilityDistribution(scores as number[], softmaxBeta);
    // for (let i = 0; i < exercises.length; i++) {
    //     exercises[i].PenalizedProbability = probabilities[i];
    // }
    const recommendedExIndex = SampleFromProbabilityDistribution(probabilities);
    //set probability of each exercise in exercise equal to the probability in probabilities:
    
    return { 
        exercise: exercises[recommendedExIndex], 
        index: recommendedExIndex, 
    }
}

export function sampleRecommendations(
    exercises: IExcercise[],
    softmaxBeta: number,
) : IExcercise[]
{
    const exercisesCopy = exercises.slice()
    let recommendedExercises: IExcercise[] = []
    for (let index = 0; index < 3; index++) {
        const sample = sampleExercise(exercisesCopy, softmaxBeta);
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

export function generateOracleTrainingDataFromSelection(
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
            rating: (
                recommendedExercises[index].InternalName == selected?.InternalName ? 
                ((starRating == undefined) ? starRating : starRating / 5) : undefined
            ),
            probability: recommendedExercises[index].Probability,
        })
    }
    return trainingData;
}


