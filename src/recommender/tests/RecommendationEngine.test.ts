import {Oracle} from '../Oracle';
import {
  RecommendationEngine,
  DemoRecommendationEngine,
} from '../RecommendationEngine';
import {IRecommendationEngineState} from '../interfaces/IRecommendationEngine';
import {IScoredExercise} from '../interfaces/IExercise';
import {IContext} from '../interfaces/IContext';
import {Exercises} from '../interfaces/Exercises';
import {IRecommendation} from '../interfaces';

describe('RecommendationEngine', () => {
  let clickOracle: Oracle;
  let ratingOracle: Oracle;
  let recommendationEngine: RecommendationEngine;

  beforeEach(() => {
    clickOracle = new Oracle(
      ['happy'], // contextFeatures
      ['article', 'breathing'], // exerciseFeatures
      ['articles_act', 'follow_your_breath', 'alternate_nostril_breathing'], // exerciseIds
      0.1,  // learningRate
      true, // contextExerciseInteractions
      true,   // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      0.5, // negativeClassWeight
      'clicked', 
    );

    ratingOracle = new Oracle(
      [], // contextFeatures
      [], // exerciseFeatures
      ['articles_act', 'follow_your_breath', 'alternate_nostril_breathing'], // exerciseIds
      0.1, // learningRate
      true, // contextExerciseInteractions
      true, // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      1.0, // negativeClassWeight
      'rating', // targetLabel
    );
    // new list of exercises with only exercises with exercideId in ['articles_act', 'follow_your_breath']
    const filteredExercises = Exercises.filter(exercise => {
      return [
        'articles_act',
        'follow_your_breath',
        'alternate_nostril_breathing',
      ].includes(exercise.ExerciseId);
    });

    recommendationEngine = new RecommendationEngine(
      clickOracle,
      ratingOracle,
      filteredExercises,
      1.0,
      0.2,
      3,
    );
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
    it('should return the correct state', () => {
      const state: IRecommendationEngineState = {
        clickOracleState: clickOracle.getOracleState(),
        ratingOracleState: ratingOracle.getOracleState(),
        softmaxBeta: 1.0,
        ratingWeight: 0.2,
        nRecommendations: 3,
      };
      expect(recommendationEngine.getRecommendationEngineState()).toEqual(
        state,
      );
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
    exerciseIds.forEach(exerciseId => {
      it('should be a key of exercises', () => {
        expect(Exercises[(exerciseId as any)]).toBeDefined();
      });
    });
  });

  describe('makeRecommendation', () => {
    let context: IContext;
    let recommendation: IRecommendation;
    beforeEach(() => {
      context = {
        happy: 1,
        sad: 0,
      };
      recommendation = recommendationEngine.makeRecommendation(context);
    });

    it('recommendation should contain three recommendations', () => {
      expect(recommendation.recommendedExercises.length).toEqual(3);
    });
    it('recommendation context should equal input context', () => {
      expect(recommendation.context).toEqual(context);
    });
    it('recommendedExercises should be unique', () => {
      const recommendedExerciseIds = recommendation.recommendedExercises.map(
        rec => {
          return rec.exerciseId;
        },
      );
      expect(recommendedExerciseIds.length).toEqual(
        new Set(recommendedExerciseIds).size,
      );
    });
    it('each recommendedExercise should have both an exerciseId a score and a probability that is defined', () => {
      recommendation.recommendedExercises.forEach(rec => {
        expect(rec.exerciseId).toBeDefined();
        expect(rec.score).toBeDefined();
        expect(rec.probability).toBeDefined();
      });
    });
  });

  describe('onCloseRecommendations', () => {
    let context: IContext;
    let recommendation: IRecommendation;
    beforeEach(() => {
      context = {
        happy: 1,
        sad: 0,
      };
      recommendation = recommendationEngine.makeRecommendation(context);
    });
    it('the weights of the clickOracle should be changed', () => {
      const oldClickWeights = recommendationEngine.clickOracle.weights;
      recommendationEngine.onCloseRecommendations(recommendation);
      expect(recommendationEngine.clickOracle.weights).not.toEqual(
        oldClickWeights,
      );
    });
    it('the weights of the ratingOracle should not be changes', () => {
      const oldRatingWeights = recommendationEngine.ratingOracle.weights;
      recommendationEngine.onCloseRecommendations(recommendation);
      expect(recommendationEngine.ratingOracle.weights).toEqual(
        oldRatingWeights,
      );
    });
    it('expect the clickOracle weight for each exerciseId in recommendedExercises to be decreased', () => {
      const oldClickWeights = recommendationEngine.clickOracle.getWeightsHash();
      recommendationEngine.onCloseRecommendations(recommendation);
      recommendation.recommendedExercises.forEach(rec => {
        expect(
          recommendationEngine.clickOracle.getWeightsHash()[rec.exerciseId],
        ).toBeLessThan(oldClickWeights[rec.exerciseId]);
      });
    });
    it('expect the clickOracle weight for each happy*exerciseId in recommendedExercises to be decreased', () => {
      const oldClickWeights = recommendationEngine.clickOracle.getWeightsHash();
      recommendationEngine.onCloseRecommendations(recommendation);
      console.log(recommendationEngine.clickOracle.getWeightsHash());
      recommendation.recommendedExercises.forEach(rec => {
        const interactionKey = `happy*${rec.exerciseId}`;
        expect(
          recommendationEngine.clickOracle.getWeightsHash()[interactionKey],
        ).toBeLessThan(oldClickWeights[interactionKey]);
      });
    });
  });

  describe('onChooseRecommendedExercise', () => {
    let context: IContext;
    let recommendation: IRecommendation;
    let chosenExerciseId: string;
    beforeEach(() => {
      context = {
        happy: 1,
        sad: 0,
      };
      recommendation = recommendationEngine.makeRecommendation(context);
      chosenExerciseId = recommendation.recommendedExercises[0].exerciseId;
    });
    it('the weights of the clickOracle should be changed', () => {
      const oldClickWeights = recommendationEngine.clickOracle.weights;
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        chosenExerciseId,
      );
      expect(recommendationEngine.clickOracle.weights).not.toEqual(
        oldClickWeights,
      );
    });
    it('the weights of the ratingOracle should not be changesd', () => {
      const oldRatingWeights = recommendationEngine.ratingOracle.weights;
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        chosenExerciseId,
      );
      expect(recommendationEngine.ratingOracle.weights).toEqual(
        oldRatingWeights,
      );
    });
    it('expect the clickOracle weight for chosenExerciseId in recommendedExercises to be increased', () => {
      const oldClickWeights =
        recommendationEngine.clickOracle.getWeightsHash();
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        chosenExerciseId,
      );
      recommendation.recommendedExercises.forEach(rec => {
        if (rec.exerciseId === chosenExerciseId) {
          expect(
            recommendationEngine.clickOracle.getWeightsHash()[rec.exerciseId],
          ).toBeGreaterThan(oldClickWeights[rec.exerciseId]);
        } else {
          expect(
            recommendationEngine.clickOracle.getWeightsHash()[rec.exerciseId],
          ).toBeLessThan(oldClickWeights[rec.exerciseId]);
        }
      });
    });
    it('expect the clickOracle weight for each happy*exerciseId in recommendedExercises to increased for the chosen exerciseId', () => {
      const oldClickWeights =
        recommendationEngine.clickOracle.getWeightsHash();
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        chosenExerciseId,
      );
      recommendation.recommendedExercises.forEach(rec => {
        const interactionKey = `happy*${rec.exerciseId}`;
        if (rec.exerciseId === chosenExerciseId) {
          expect(
            recommendationEngine.clickOracle.getWeightsHash()[interactionKey],
          ).toBeGreaterThan(oldClickWeights[interactionKey]);
        } else {
          expect(
            recommendationEngine.clickOracle.getWeightsHash()[interactionKey],
          ).toBeLessThan(oldClickWeights[interactionKey]);
        }
      });
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
});

describe('DemoRecommendationEngine', () => {
  let clickOracle: Oracle;
  let ratingOracle: Oracle;
  let demoRecommendationEngine: DemoRecommendationEngine;

  beforeEach(() => {
    clickOracle = new Oracle(
      ['happy'], // contextFeatures
      ['article', 'breathing'], // exerciseFeatures
      ['articles_act', 'follow_your_breath', 'alternate_nostril_breathing'], // exerciseIds
      0.1,  // learningRate
      true, // contextExerciseInteractions
      true,   // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      0.5, // negativeClassWeight
      'clicked', 
    );

    ratingOracle = new Oracle(
      [], // contextFeatures
      [], // exerciseFeatures
      ['articles_act', 'follow_your_breath', 'alternate_nostril_breathing'], // exerciseIds
      0.1, // learningRate
      true, // contextExerciseInteractions
      true, // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      1.0, // negativeClassWeight
      'rating', // targetLabel
    );
    // new list of exercises with only exercises with exercideId in ['articles_act', 'follow_your_breath']
    const filteredExercises = Exercises.filter(exercise => {
      return ['articles_act', 'follow_your_breath'].includes(
        exercise.ExerciseId,
      );
    });

    demoRecommendationEngine = new DemoRecommendationEngine(
      clickOracle,
      ratingOracle,
      filteredExercises,
      1.0,
      0.2,
      3,
    );
  });

  describe('scoreAllExercises', () => {
    it('should return the correct scores', () => {
      const context: IContext = {
        happy: 1,
        sad: 0,
      };
      const scoredExercises: IScoredExercise[] =
        demoRecommendationEngine.scoreAllExercises(context);
      const expectedScores: IScoredExercise[] = [
        {
          ExerciseId: 'articles_act',
          ExerciseName: 'Article ACT',
          AggregateScore: 0.5,
          ClickScore: 0.5,
          Probability: 0.5,
          RatingScore: 0.5,
          SelectedCount: undefined,
        },
        {
          AggregateScore: 0.5,
          ClickScore: 0.5,
          ExerciseId: 'follow_your_breath',
          ExerciseName: 'Follow Your Breath',
          Probability: 0.5,
          RatingScore: 0.5,
          SelectedCount: undefined,
        },
      ];
      expect(scoredExercises).toEqual(expectedScores);
    });
  });
});
