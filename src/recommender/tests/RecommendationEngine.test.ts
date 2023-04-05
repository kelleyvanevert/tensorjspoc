import { Oracle } from '../Oracle';
import { RecommendationEngine, DemoRecommendationEngine } from '../RecommendationEngine';
import { IRecommendationEngineState } from '../interfaces/IRecommendationEngine';
import { IScoredExercise } from '../interfaces/IExercise';
import { IContext } from '../interfaces/IContext';
import { Exercises } from '../interfaces/Exercises';


describe('RecommendationEngine', () => {
    let clickOracle: Oracle;
    let ratingOracle: Oracle;
    let recommendationEngine: RecommendationEngine;


    beforeEach(() => {
        clickOracle = new Oracle(
          ['happy'],
          ['article', 'breathing'],
          ['articles_act', 'follow_your_breath'],
          0.1,
          1,
          true,
          true,
          true,
          true,
          false,
          'click',
        );

        ratingOracle = new Oracle(
            [],
            [],
            ['articles_act', 'follow_your_breath'],
            0.1,
            1,
            true,
            true,
            true,
            true,
            false,
            'click',
          );
        // new list of exercises with only exercises with exercideId in ['articles_act', 'follow_your_breath']
        const filteredExercises = Exercises.filter((exercise) => {
            return ['articles_act', 'follow_your_breath'].includes(exercise.ExerciseId);
          });


        recommendationEngine = new RecommendationEngine(
            clickOracle, 
            ratingOracle, 
            filteredExercises, 
            1.0, 
            0.2, 
            3)
        
      });

      describe('constructor', () => {
        it('should create an instance of RecommendationEngine with the correct properties', () => {
          expect(recommendationEngine.clickOracle).toEqual(clickOracle);
          expect(recommendationEngine.ratingOracle).toEqual(ratingOracle);
          expect(recommendationEngine.softmaxBeta).toEqual(1.0);
          expect(recommendationEngine.ratingWeight).toEqual(0.2);
          expect(recommendationEngine.nRecommendations).toEqual(3);
        });
      });

      describe('getRecommendationEngineState', () => {
        it('should return the correct state' , () => {
            const state: IRecommendationEngineState = {
                clickOracleState: clickOracle.getOracleState(),
                ratingOracleState: ratingOracle.getOracleState(),
                softmaxBeta: 1.0,
                ratingWeight: 0.2,
                nRecommendations: 3,
            };
            expect(recommendationEngine.getRecommendationEngineState()).toEqual(state);
        });
      });

      describe('toJSON', () => {
        it('should return the correct JSON string', () => {
          const state: IRecommendationEngineState = {
            clickOracleState: clickOracle.getOracleState(),
            ratingOracleState: ratingOracle.getOracleState(),
            softmaxBeta: 1.0,
            ratingWeight: 0.2,
            nRecommendations: 3,
          };
          expect(recommendationEngine.toJSON()).toEqual(JSON.stringify(state));
        });
      });

      describe('all exercideIds should be keys of exercises', () => {
        const exerciseIds = Object.keys(Exercises);
        exerciseIds.forEach((exerciseId) => {
            it('should be a key of exercises', () => {
                expect(Exercises[exerciseId]).toBeDefined();
            });
            });
      });
        
});

describe('DemoRecommendationEngine', () => {
  let clickOracle: Oracle;
  let ratingOracle: Oracle;
  let demoRecommendationEngine: DemoRecommendationEngine;


  beforeEach(() => {
      clickOracle = new Oracle(
        ['happy'],
        ['article', 'breathing'],
        ['articles_act', 'follow_your_breath'],
        0.1,
        1,
        true,
        true,
        true,
        true,
        false,
        'click',
      );

      ratingOracle = new Oracle(
          [],
          [],
          ['articles_act', 'follow_your_breath'],
          0.1,
          1,
          true,
          true,
          true,
          true,
          false,
          'click',
        );
      // new list of exercises with only exercises with exercideId in ['articles_act', 'follow_your_breath']
      const filteredExercises = Exercises.filter((exercise) => {
          return ['articles_act', 'follow_your_breath'].includes(exercise.ExerciseId);
        });


      demoRecommendationEngine = new DemoRecommendationEngine(
          clickOracle, 
          ratingOracle, 
          filteredExercises, 
          1.0, 
          0.2, 
          3)
      
    });

    describe('scoreAllExercises', () => {
      it('should return the correct scores', () => {
          const context: IContext = {
              happy: 1,
              sad: 0,
          };
          const scoredExercises: IScoredExercise[] = demoRecommendationEngine.scoreAllExercises(context);
          const expectedScores:IScoredExercise[] = [
              {"ExerciseId": "articles_act", "ExerciseName": "Article ACT", "AggregateScore": 0.5, "ClickScore": 0.5, "Probability": 0.5, "RatingScore": 0.5, "SelectedCount": undefined}, 
              {"AggregateScore": 0.5, "ClickScore": 0.5, "ExerciseId": "follow_your_breath", "ExerciseName": "Follow Your Breath", "Probability": 0.5, "RatingScore": 0.5, "SelectedCount": undefined}
          ];
          expect(scoredExercises).toEqual(expectedScores);
      });
  });

  });


