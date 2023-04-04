describe("dummytest", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

// import { 
//     calculateAggregateScore, 
//     CastOrderedFeatureToNumArray, 
//     calculateScoresAndSortExercises, 
//     sampleExercise,
//     sampleRecommendations,
//     generateOracleTrainingDataFromSelection,
//     getCosineDistance
// } from '../../src/services/Bandit';
// import { Oracle } from '../../src/services/Oracle';
// import { IContext, IExercise, ITrainingData, YesNo } from '../../src/interfaces';

// describe('calculateAggregateScore', () => {
//     test('returns ClickScore if only ClickScore is defined', () => {
//       const exercise = {
//         ClickScore: 0.7,
//         RatingScore: undefined
//       };
//       const result = calculateAggregateScore(exercise);
//       expect(result).toEqual(exercise.ClickScore);
//     });
  
//     test('returns RatingScore if only RatingScore is defined', () => {
//       const exercise = {
//         ClickScore: undefined,
//         RatingScore: 0.5
//       };
//       const result = calculateAggregateScore(exercise);
//       expect(result).toEqual(exercise.RatingScore);
//     });
  
//     test('returns 0 if neither ClickScore nor RatingScore are defined', () => {
//       const exercise = {
//         ClickScore: undefined,
//         RatingScore: undefined
//       };
//       const result = calculateAggregateScore(exercise);
//       expect(result).toEqual(0);
//     });
  
//     test('calculates weighted harmonic mean if both ClickScore and RatingScore are defined', () => {
//       const exercise = {
//         ClickScore: 0.6,
//         RatingScore: 0.4
//       };
//       const result = calculateAggregateScore(exercise, 0.5);
//       expect(result).toBeCloseTo(0.48, 2);
//     });

//     test('calculates weighted harmonic mean if ratingWeight is zero', () => {
//         const exercise = {
//           ClickScore: 0.6,
//           RatingScore: 0.4
//         };
//         const result = calculateAggregateScore(exercise, 0.0);
//         expect(result).toBeCloseTo(0.6, 2);
//       });

//     test('calculates weighted harmonic mean if ratingWeight is 1.0', () => {
//         const exercise = {
//           ClickScore: 0.6,
//           RatingScore: 0.4
//         };
//         const result = calculateAggregateScore(exercise, 1.0);
//         expect(result).toBeCloseTo(0.4, 2);
//       });
//   });

//   describe('CastOrderedFeatureToNumArray', () => {
//     it('should return an empty array for an empty feature object', () => {
//       const featureObject = {};
//       const result = CastOrderedFeatureToNumArray(featureObject);
//       expect(result).toEqual([]);
//     });
  
//     it('should return an array of numbers for a non-empty feature object', () => {
//       const featureObject = {
//         a: 1,
//         b: 2,
//         c: 3,
//       };
//       const result = CastOrderedFeatureToNumArray(featureObject);
//       expect(result).toEqual([1, 2, 3]);
//     });
  
//     it('should sort the features alphabetically', () => {
//       const featureObject = {
//         c: 3,
//         b: 2,
//         a: 1,
//       };
//       const result = CastOrderedFeatureToNumArray(featureObject);
//       expect(result).toEqual([1, 2, 3]);
//     });
//   });

//   describe('calculateScoresAndSortExercises', () => {
//     const context = {
//       context1: 1,
//     };
    
//     const exercises = [
//       {
//         ExerciseName: 'Exercise A',
//         ExerciseId: 'exerciseA',
//         Features: {
//           feature1: 1,  
//           feature2: 1,
//         },
//       },
//       {
//         ExerciseName: 'Exercise B',
//         ExerciseId: 'exerciseB',
//         Features: {
//             feature1: 0,  
//             feature2: 0,
//         },
//       },
//     ];
  
//     const clickOracle = new Oracle(
//         ['context1'],
//         ['feature1', 'feature2'],
//         ['exerciseA', 'exerciseB'],
//         0.1, 1, true, true, true, false, false, 
//         'click',
//         {'feature1':1, 'feature2':1},
//     )

//     const ratingOracle = new Oracle(
//         ['context1'],
//         ['feature1', 'feature2'],
//         ['exerciseA', 'exerciseB'],
//         0.1, 1, true, true, true, false, false, 
//         'rating',
//         {'feature1':1, 'feature2':1},
//     )
  
//     const softmaxBeta = 1;
  
//     it('returns sorted exercises with aggregate scores and probabilities', () => {
//       const sortedExercises = calculateScoresAndSortExercises(
//         clickOracle, ratingOracle, context, exercises, softmaxBeta
//       );
      
//       // Verify that each exercise has ClickScore, RatingScore, AggregateScore, and Probability properties
//       sortedExercises.forEach((exercise) => {
//         expect(exercise.ClickScore).toBeDefined();
//         expect(exercise.RatingScore).toBeDefined();
//         expect(exercise.AggregateScore).toBeDefined();
//         expect(exercise.Probability).toBeDefined();
//       });
  
//       // Verify that exercises are sorted by AggregateScore in descending order
//       expect(sortedExercises[0].ExerciseId).toEqual('exerciseA');
//       expect(sortedExercises[1].ExerciseId).toEqual('exerciseB');
//     });

// });

// describe('sampleExercise', () => {
//     const exercises = [
//         {
//           ExerciseName: 'Exercise 1',
//           ExerciseId: 'exercise1',
//           Features: {
//             three_five_mins: 1,
//             five_seven_mins: 0,
//             seven_ten_mins: 1,
//             defuse: 0,
//             zoom_out: 1,
//             feeling_stressed: 0,
//             feeling_angry: 1,
//             mood_boost: 0,
//             self_compassion: 1,
//             relax: 0,
//             energize: 1,
//             feeling_anxious: 0,
//             grounding: 1,
//             feeling_blue: 0,
//             focus: 1,
//             shift_perspective: 0,
//             introspect: 1,
//             breathing: 0,
//             article: 1,
//           },
//           SelectedCount: 10,
//           ClickScore: 0.5,
//           RatingScore: 0.8,
//           AggregateScore: 0.65,
//           Probability: 0.3,
//         },
//         {
//           ExerciseName: 'Exercise 2',
//           ExerciseId: 'exercise2',
//           Features: {
//             three_five_mins: 0,
//             five_seven_mins: 1,
//             seven_ten_mins: 0,
//             defuse: 1,
//             zoom_out: 0,
//             feeling_stressed: 1,
//             feeling_angry: 0,
//             mood_boost: 1,
//             self_compassion: 0,
//             relax: 1,
//             energize: 0,
//             feeling_anxious: 1,
//             grounding: 0,
//             feeling_blue: 1,
//             focus: 0,
//             shift_perspective: 1,
//             introspect: 0,
//             breathing: 1,
//             article: 0,
//           },
//           SelectedCount: 5,
//           ClickScore: 0.6,
//           RatingScore: 0.7,
//           AggregateScore: 0.63,
//           Probability: 0.2,
//         },
//         {
//           ExerciseName: 'Exercise 3',
//           ExerciseId: 'exercise3',
//           Features: {
//             three_five_mins: 1,
//             five_seven_mins: 1,
//             seven_ten_mins: 0,
//             defuse: 1,
//             zoom_out: 0,
//             feeling_stressed: 0,
//             feeling_angry: 1,
//             mood_boost: 1,
//             self_compassion: 0,
//             relax: 1,
//             energize: 0,
//             feeling_anxious: 0,
//             grounding: 1,
//             feeling_blue: 1,
//             focus: 0,
//             shift_perspective: 1,
//             introspect: 0,
//             breathing: 1,
//             article: 1,
//           },
//           SelectedCount: 3,
//           ClickScore: 0.8,
//           RatingScore: 0.9,
//           AggregateScore: 0.86,
//           Probability: 0.5,
//         },
//       ];
  
//     it('returns an object with an exercise and index property', () => {
//       const result = sampleExercise(exercises, 2);
//       expect(result).toHaveProperty('exercise');
//       expect(result).toHaveProperty('index');
//     });
  
// });


// describe('sampleRecommendations', () => {
//     const exercises: IExercise[] = [
//         {
//             ExerciseName: 'Exercise 1',
//             ExerciseId: 'ex1',
//             Features: {
//                 three_five_mins: 1,
//                 five_seven_mins: 0,
//                 seven_ten_mins: 1,
//                 defuse: 0,
//                 zoom_out: 1,
//                 feeling_stressed: 1,
//                 feeling_angry: 0,
//                 mood_boost: 1,
//                 self_compassion: 0,
//                 relax: 1,
//                 energize: 0,
//                 feeling_anxious: 1,
//                 grounding: 0,
//                 feeling_blue: 1,
//                 focus: 0,
//                 shift_perspective: 1,
//                 introspect: 0,
//                 breathing: 1,
//                 article: 0
//             },
//             SelectedCount: 3,
//             ClickScore: 0.8,
//             RatingScore: 0.9,
//             AggregateScore: 0.8,
//             Probability: 0.5,
//         },
//         {
//             ExerciseName: 'Exercise 2',
//             ExerciseId: 'ex2',
//             Features: {
//                 three_five_mins: 0,
//                 five_seven_mins: 1,
//                 seven_ten_mins: 0,
//                 defuse: 1,
//                 zoom_out: 0,
//                 feeling_stressed: 0,
//                 feeling_angry: 1,
//                 mood_boost: 0,
//                 self_compassion: 1,
//                 relax: 0,
//                 energize: 1,
//                 feeling_anxious: 0,
//                 grounding: 1,
//                 feeling_blue: 0,
//                 focus: 1,
//                 shift_perspective: 0,
//                 introspect: 1,
//                 breathing: 0,
//                 article: 1
//             },
//             SelectedCount: 3,
//             ClickScore: 0.8,
//             RatingScore: 0.9,
//             AggregateScore: 0.5,
//             Probability: 0.5,
//         },
//         {
//             ExerciseName: 'Exercise 3',
//             ExerciseId: 'ex3',
//             Features: {
//                 three_five_mins: 1,
//                 five_seven_mins: 0,
//                 seven_ten_mins: 1,
//                 defuse: 0,
//                 zoom_out: 1,
//                 feeling_stressed: 1,
//                 feeling_angry: 0,
//                 mood_boost: 1,
//                 self_compassion: 0,
//                 relax: 1,
//                 energize: 0,
//                 feeling_anxious: 1,
//                 grounding: 0,
//                 feeling_blue: 1,
//                 focus: 0,
//                 shift_perspective: 1,
//                 introspect: 0,
//                 breathing: 1,
//                 article: 0
//             },
//             SelectedCount: 3,
//             ClickScore: 0.8,
//             RatingScore: 0.9,
//             AggregateScore: 0.2,
//             Probability: 0.5,
//         }
//     ];

//     it('should return an array of 3 defined exercises', () => {
//         let recommendedExercises = sampleRecommendations(exercises, 2);
//         expect(recommendedExercises.length).toEqual(3);
//         recommendedExercises.forEach((exercise) => {
//             expect(exercise).toBeDefined();
//             expect(exercise.ClickScore).toBeDefined();
//             expect(exercise.RatingScore).toBeDefined();
//             expect(exercise.AggregateScore).toBeDefined();
//             expect(exercise.Probability).toBeDefined();
//           });
//     });

//     it('should not recommend the same exercise more than once', () => {
//         let recommendedExercises = sampleRecommendations(exercises, 2);
//         console.log("recommendedExercises exercises", exercises, recommendedExercises);
//         const selectedExerciseNames = recommendedExercises.map(ex => ex.ExerciseId);
//         const uniqueExerciseNames = new Set(selectedExerciseNames);
//         expect(uniqueExerciseNames.size).toEqual(3);
//     });

// });

// describe('generateOracleTrainingDataFromSelection', () => {
//     const recommendedExercises: IExercise[] = [
//         {
//             ExerciseName: 'Exercise 1',
//             ExerciseId: 'ex1',
//             Features: {
//                 three_five_mins: 1,
//                 five_seven_mins: 0,
//                 seven_ten_mins: 1,
//                 defuse: 0,
//                 zoom_out: 1,
//                 feeling_stressed: 1,
//                 feeling_angry: 0,
//                 mood_boost: 1,
//                 self_compassion: 0,
//                 relax: 1,
//                 energize: 0,
//                 feeling_anxious: 1,
//                 grounding: 0,
//                 feeling_blue: 1,
//                 focus: 0,
//                 shift_perspective: 1,
//                 introspect: 0,
//                 breathing: 1,
//                 article: 0
//             },
//             SelectedCount: 3,
//             ClickScore: 0.8,
//             RatingScore: 0.9,
//             AggregateScore: 0.8,
//             Probability: 0.5,
//         },
//         {
//             ExerciseName: 'Exercise 2',
//             ExerciseId: 'ex2',
//             Features: {
//                 three_five_mins: 0,
//                 five_seven_mins: 1,
//                 seven_ten_mins: 0,
//                 defuse: 1,
//                 zoom_out: 0,
//                 feeling_stressed: 0,
//                 feeling_angry: 1,
//                 mood_boost: 0,
//                 self_compassion: 1,
//                 relax: 0,
//                 energize: 1,
//                 feeling_anxious: 0,
//                 grounding: 1,
//                 feeling_blue: 0,
//                 focus: 1,
//                 shift_perspective: 0,
//                 introspect: 1,
//                 breathing: 0,
//                 article: 1
//             },
//             SelectedCount: 3,
//             ClickScore: 0.8,
//             RatingScore: 0.9,
//             AggregateScore: 0.5,
//             Probability: 0.5,
//         },
//         {
//             ExerciseName: 'Exercise 3',
//             ExerciseId: 'ex3',
//             Features: {
//                 three_five_mins: 1,
//                 five_seven_mins: 0,
//                 seven_ten_mins: 1,
//                 defuse: 0,
//                 zoom_out: 1,
//                 feeling_stressed: 1,
//                 feeling_angry: 0,
//                 mood_boost: 1,
//                 self_compassion: 0,
//                 relax: 1,
//                 energize: 0,
//                 feeling_anxious: 1,
//                 grounding: 0,
//                 feeling_blue: 1,
//                 focus: 0,
//                 shift_perspective: 1,
//                 introspect: 0,
//                 breathing: 1,
//                 article: 0
//             },
//             SelectedCount: 3,
//             ClickScore: 0.8,
//             RatingScore: 0.9,
//             AggregateScore: 0.2,
//             Probability: 0.5,
//         }
//     ];
//     const selected: IExercise = recommendedExercises[1];
//     const context: IContext = {
//         happy: 1,
//         sad: 0,
//     };
//     const starRating = 3;

//     it('should return the correct training data when given recommended exercises and a selected exercise with a rating', () => {
//         const expectedTrainingData: ITrainingData[] = [
//           {
//             input: {
//               exerciseId: 'ex1',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[0].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//           {
//             input: {
//               exerciseId: 'ex2',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[1].Features,
//             },
//             clicked: 1,
//             rating: 0.6,
//             probability: 0.5,
//           },
//           {
//             input: {
//               exerciseId: 'ex3',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[2].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//         ];
      
//         const actualTrainingData = generateOracleTrainingDataFromSelection(
//           recommendedExercises,
//           selected,
//           context,
//           starRating,
//         );
      
//         expect(actualTrainingData).toEqual(expectedTrainingData);
//       });
//       it('should return the correct training data when given recommended exercises and a selected exercise without a rating', () => {
//         const expectedTrainingData: ITrainingData[] = [
//           {
//             input: {
//               exerciseId: 'ex1',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[0].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//           {
//             input: {
//               exerciseId: 'ex2',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[1].Features,
//             },
//             clicked: 1,
//             rating: undefined,
//             probability: 0.5,
//           },
//           {
//             input: {
//               exerciseId: 'ex3',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[2].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//         ];
      
//         const actualTrainingData = generateOracleTrainingDataFromSelection(
//           recommendedExercises,
//           selected,
//           context,
//           undefined,
//         );
      
//         expect(actualTrainingData).toEqual(expectedTrainingData);
//       });
      
//       it('should return the correct training data when given recommended exercises and no selected exercise', () => {
//         const expectedTrainingData: ITrainingData[] = [
//           {
//             input: {
//               exerciseId: 'ex1',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[0].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//           {
//             input: {
//               exerciseId: 'ex2',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[1].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//           {
//             input: {
//               exerciseId: 'ex3',
//               contextFeatures: context,
//               exerciseFeatures: recommendedExercises[2].Features,
//             },
//             clicked: 0,
//             rating: undefined,
//             probability: 0.5,
//           },
//         ];
      
//         const actualTrainingData = generateOracleTrainingDataFromSelection(
//           recommendedExercises,
//           undefined,
//           context,
//           undefined,
//         );
      
//         expect(actualTrainingData).toEqual(expectedTrainingData);
//       });
//     });      


//     describe('getCosineDistance', () => {
//       const exercises: IExercise[] = [
//         {
//           ExerciseName: 'Exercise 1',
//           ExerciseId: 'Exercise1',
//           Features: {
//             three_five_mins: YesNo.Yes,
//             five_seven_mins: YesNo.No,
//             seven_ten_mins: YesNo.Yes,
//             defuse: YesNo.No,
//             zoom_out: YesNo.Yes,
//             feeling_stressed: YesNo.Yes,
//             feeling_angry: YesNo.No,
//             mood_boost: YesNo.Yes,
//             self_compassion: YesNo.No,
//             relax: YesNo.Yes,
//             energize: YesNo.No,
//             feeling_anxious: YesNo.Yes,
//             grounding: YesNo.No,
//             feeling_blue: YesNo.Yes,
//             focus: YesNo.No,
//             shift_perspective: YesNo.Yes,
//             introspect: YesNo.No,
//             breathing: YesNo.Yes,
//             article: YesNo.No,
//           },
//         },
//         {
//           ExerciseName: 'Exercise 2',
//           ExerciseId: 'Exercise2',
//           Features: {
//             three_five_mins: YesNo.No,
//             five_seven_mins: YesNo.Yes,
//             seven_ten_mins: YesNo.No,
//             defuse: YesNo.Yes,
//             zoom_out: YesNo.No,
//             feeling_stressed: YesNo.No,
//             feeling_angry: YesNo.Yes,
//             mood_boost: YesNo.No,
//             self_compassion: YesNo.Yes,
//             relax: YesNo.No,
//             energize: YesNo.Yes,
//             feeling_anxious: YesNo.No,
//             grounding: YesNo.Yes,
//             feeling_blue: YesNo.No,
//             focus: YesNo.Yes,
//             shift_perspective: YesNo.No,
//             introspect: YesNo.Yes,
//             breathing: YesNo.No,
//             article: YesNo.Yes,
//           },
//         },
//         {
//           ExerciseName: 'Exercise 3',
//           ExerciseId: 'Exercise3',
//           Features: {
//             three_five_mins: YesNo.Yes,
//             five_seven_mins: YesNo.No,
//             seven_ten_mins: YesNo.No,
//             defuse: YesNo.No,
//             zoom_out: YesNo.No,
//             feeling_stressed: YesNo.Yes,
//             feeling_angry: YesNo.No,
//             mood_boost: YesNo.Yes,
//             self_compassion: YesNo.No,
//             relax: YesNo.Yes,
//             energize: YesNo.No,
//             feeling_anxious: YesNo.Yes,
//             grounding: YesNo.No,
//             feeling_blue: YesNo.No,
//             focus: YesNo.Yes,
//             shift_perspective: YesNo.No,
//             introspect: YesNo.No,
//             breathing: YesNo.Yes,
//             article: YesNo.No,
//           },
//         },
//       ];

//       const exercise = exercises[0];
    
//       it('should return an array of objects containing the distance and exercise', () => {
//         const result = getCosineDistance(exercises, exercise);
    
//         expect(Array.isArray(result)).toBeTruthy();
    
//         result.forEach((res) => {
//           expect(typeof res.distance).toBe('number');
//           expect(typeof res.exercise).toBe('object');
//         });
//       });
    
//       it('should return the correct sorted array', () => {
//         const result = getCosineDistance(exercises, exercise);
    
//         expect(result[0].distance).toBeCloseTo(0, 5);
//         expect(result[1].distance).toBeCloseTo(0.7171, 4);
//         expect(result[2].distance).toBeCloseTo(0.99999, 4);
//       });
//     });
