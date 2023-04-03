// import { IContext, IExercise, IExerciseFeatures, ITrainingData } from '../interfaces';
// import { Oracle } from './Oracle';
// import { 
//     weightedHarmonicMean, 
//     ConvertScoresToProbabilityDistribution, 
//     SampleFromProbabilityDistribution,
//     CosineSimilarity,
// } from './MathService';


// export function calculateAggregateScore(exercise: IExercise, ratingWeight: number = 0.5) {
//     if (!exercise || typeof exercise !== 'object' || !('ClickScore' in exercise) || !('RatingScore' in exercise)) {
//         throw new Error('Exercise object must contain ClickScore and RatingScore fields.');
//       }
//     if (typeof ratingWeight !== 'number') {
//         throw new Error('Rating weight must be a number.');
//       }
//     if ((exercise.ClickScore == undefined) && (exercise.RatingScore != undefined)) {    
//         return exercise.RatingScore;
//     } else if ((exercise.ClickScore != undefined) && (exercise.RatingScore == undefined)) { 
//         return exercise.ClickScore;
//     } else if ((exercise.ClickScore == undefined) && (exercise.RatingScore == undefined)) { 
//         return 0;
//     }  else {
//         return weightedHarmonicMean(
//             [exercise.ClickScore, exercise.RatingScore], 
//             [1-ratingWeight, ratingWeight]
//         );
//     }
// }

// export const CastOrderedFeatureToNumArray = (exercise_feature: IExerciseFeatures): number[] => {
//     if (!exercise_feature || typeof exercise_feature !== 'object') {
//       throw new Error('Exercise feature must be an object.');
//     }
//     const keys = Object.keys(exercise_feature);
//     if (!keys.every(key => typeof exercise_feature[key as keyof typeof exercise_feature] === 'number')) {
//       throw new Error('Exercise feature object must contain only numeric values.');
//     }
//     if (keys.length === 0) {
//       return [];
//     }
//     const sortedKeys = keys.slice().sort();
//     return sortedKeys.map(key => exercise_feature[key as keyof typeof exercise_feature]);
//   }

// export function getCosineDistance (exercises:IExercise[], exercise: IExercise
//     ): { exercise: IExercise, distance: number }[] {
//     if (!Array.isArray(exercises)) {
//         throw new Error('Exercises must be an array.');
//     }
//     if (!exercise || typeof exercise !== 'object' || !('Features' in exercise)) {
//         throw new Error('Exercise object must contain Features field.');
//     }
//     if (exercises.length === 0) {
//         return [];
//       }
//     const currentExValue = CastOrderedFeatureToNumArray(exercise.Features);
//       if (currentExValue.length === 0) {
//         throw new Error('Exercise feature array is empty.');
//       }
//     const result: { exercise: IExercise, distance: number }[] = []
//     exercises.forEach((ex) => {
//         if (ex && typeof ex === 'object' && 'Features' in ex) {
//             const exValue = CastOrderedFeatureToNumArray(ex.Features);
//             if (exValue.length === 0) {
//               return;
//             }
//             const distance = CosineSimilarity(currentExValue, exValue);
//             result.push({
//               exercise: ex,
//               distance: distance
//             });
//           }
//     })

//     result.sort((a, b) => (a.distance - b.distance));
//     return result
// }

// export function calculateScoresAndSortExercises(
//     clickOracle: Oracle,
//     ratingOracle: Oracle,
//     context: IContext, 
//     exercises: IExercise[], 
//     softmaxBeta: number,
//     ratingWeight: number = 0.5,
//     ) :IExercise[] {
//     if (!(clickOracle instanceof Oracle) || !(ratingOracle instanceof Oracle)) {
//         throw new Error('ClickOracle and RatingOracle must be instances of the Oracle class.');
//         }
//     if (!Array.isArray(exercises)) {
//         throw new Error('Exercises must be an array.');
//     }
//     if (exercises.length === 0) {return [];}
//     let sortedExercises: IExercise[] = [];
//     let SoftmaxNumerators: number[] = []
//     for (let index = 0; index < exercises.length; index++) {
//         const exercise = exercises[index];
//         const clickScore = clickOracle.predictProba(context, exercise.Features, exercise.ExerciseId);
        
//         const ratingScore = ratingOracle.predictProba(context, exercise.Features, exercise.ExerciseId);
//         if (clickScore === undefined || typeof clickScore !== 'number') {
//             exercise.ClickScore = 0;
//         } else {
//             exercise.ClickScore = clickScore;
//         }
//         if (ratingScore === undefined || typeof ratingScore !== 'number') {
//             exercise.RatingScore = 0;
//         } else {
//             exercise.RatingScore = ratingScore;
//         }
//         exercise.AggregateScore = calculateAggregateScore(exercise, ratingWeight);
//         SoftmaxNumerators.push(Math.exp(softmaxBeta * (exercise.AggregateScore || 0)));
//         sortedExercises.push(exercise)
//     }
//     let SoftmaxDenominator = SoftmaxNumerators.reduce((a, b) => a + b, 0);
//     for (let index = 0; index < sortedExercises.length; index++) {
//         const exercise = sortedExercises[index];
//         exercise.Probability = SoftmaxNumerators[index] / SoftmaxDenominator;
//     }

//     sortedExercises = sortedExercises.sort((a, b) => (b.AggregateScore || 0) - (a.AggregateScore || 0));
//     // console.log("weights -> ", clickOracle.getWeightsMap())
//     return sortedExercises;
// }


// export function sampleExercise(
//     exercises: IExercise[], 
//     softmaxBeta: number = 2,
//  ) : {exercise: IExercise, index: number} {
//     if (!Array.isArray(exercises)) {
//         throw new Error('Exercises must be an array.');
//     }
//     if (exercises.length === 0) {
//         throw new Error('Exercises array is empty.');
//     }
//     if (!exercises.every((exercise) => typeof exercise === 'object' && exercise !== null && 'AggregateScore' in exercise)) {
//         throw new Error('Exercises array must contain AggregateScore field.');
//     }
//     const scores = exercises.map(exercise => exercise.AggregateScore);
//     if (!scores || scores.some((score) => typeof score !== 'number')) {
//         throw new Error('Invalid scores. Scores must be an array of numbers.');
//     }
//     const probabilities = ConvertScoresToProbabilityDistribution(scores as number[], softmaxBeta);
//     if (probabilities.length === 0) {
//         throw new Error('Probabilities array is empty.');
//       }
//     const recommendedExIndex = SampleFromProbabilityDistribution(probabilities);

//     return { 
//         exercise: exercises[recommendedExIndex], 
//         index: recommendedExIndex, 
//     }
// }

// export function sampleRecommendations(
//     exercises: IExercise[],
//     softmaxBeta: number,
// ) : IExercise[]
// {
//     if (!Array.isArray(exercises)) {
//         throw new TypeError('Exercises must be an array.');
//     }
//     if (exercises.length === 0) {
//         throw new Error('Exercises array is empty.');
//     }
//     if (!exercises.every((exercise) => typeof exercise === 'object' && exercise !== null && 'AggregateScore' in exercise)) {
//         throw new TypeError('Exercises array must contain objects with AggregateScore field.');
//     }
//     if (typeof softmaxBeta !== 'number') {
//         throw new TypeError('SoftmaxBeta must be a number.');
//     }
    
//     const exercisesCopy = exercises.slice()
//     let recommendedExercises: IExercise[] = []
//     for (let index = 0; index < 3; index++) {
//         const sample = sampleExercise(exercisesCopy, softmaxBeta);
//         if (!sample.exercise) {
//             throw new Error('Failed to sample an exercise.');
//         }
//         recommendedExercises[index] = sample.exercise; // set i-th recommendation
        
//         exercisesCopy.splice(sample.index, 1); // remove the recent recommended item

//         // const distance = getCosineDistance(exercisesCopy, sample.exercise); // calculate distance between curr and all "remaining" exercises
//         // const mostSimilarItemToSelectedExercise = distance[distance.length - 1]
//         // // console.log("Sample -> ", sample.exercise.ExerciseName, "\nRemoved Similar -> ", mostSimilarItemToSelectedExercise.exercise.ExerciseId)
//         // let indexToRemove = exercisesCopy.findIndex(s => s.ExerciseId == mostSimilarItemToSelectedExercise.exercise.ExerciseId)
//         // exercisesCopy.splice(indexToRemove, 1)
//         // remove the last selected value and shrink size by 1
//     }
//     return recommendedExercises
// }

// export function generateOracleTrainingDataFromSelection(
//     recommendedExercises: IExercise[],
//     selected: IExercise | undefined,
//     context: IContext,
//     starRating: number | undefined,
//     ) : ITrainingData[] {
//     if (!Array.isArray(recommendedExercises)) {
//         throw new TypeError('Recommended exercises must be an array.');
//     }
//     if (recommendedExercises.length === 0) {
//         throw new Error('Recommended exercises array is empty.');
//     }
//     if (!recommendedExercises.every((exercise) => typeof exercise === 'object' && exercise !== null && 'ExerciseId' in exercise && 'Features' in exercise && 'Probability' in exercise)) {
//         throw new TypeError('Recommended exercises array must contain objects with ExerciseId, Features and Probability fields.');
//     }
//     if (selected !== undefined && !('ExerciseId' in selected && 'Features' in selected)) {
//         throw new TypeError('Selected exercise must be an object with ExerciseId and Features fields.');
//     }
//     if (starRating !== undefined && (typeof starRating !== 'number' || starRating < 1 || starRating > 5)) {
//         throw new TypeError('Star rating must be a number between 1 and 5.');
//     }
//     let trainingData: ITrainingData[] = []
//     for (let index = 0; index < recommendedExercises.length; index++) {
//         const recommendedExercise = recommendedExercises[index];
//         if (!recommendedExercise) {
//           throw new Error(`Failed to generate training data for recommended exercise at index ${index}.`);
//         }
    
//         const input = {
//           exerciseName: recommendedExercise.ExerciseId,
//           contextFeatures: context,
//           exerciseFeatures: recommendedExercise.Features,
//         };
//         const clicked = recommendedExercise.ExerciseId === selected?.ExerciseId ? 1 : 0;
//         const rating = clicked ? starRating !== undefined ? starRating / 5 : undefined : undefined;
//         const probability = recommendedExercise.Probability;
    
//         trainingData.push({ input, clicked, rating, probability });
//       }
//     return trainingData;
// }


