import {Oracle} from '../Oracle';
import {
  RecommendationEngine,
  DemoRecommendationEngine,
} from '../RecommendationEngine';
import {IRecommendationEngineState} from '../interfaces/IRecommendationEngine';
import {IScoredExercise} from '../interfaces/IExercise';
import {IContext, createDefaultContext} from '../interfaces/IContext';
import {Exercises} from '../interfaces/Exercises';
import {IRecommendation} from '../interfaces';
import { create } from 'domain';

describe('RecommendationEngine', () => {
  let clickOracle: Oracle;
  let likingOracle: Oracle;
  let helpfulnessOracle: Oracle;
  let recommendationEngine: RecommendationEngine;
  const testExerciseIds = ['positive_self_talk', 'follow_your_breath', 'alternate_nostril_breathing'];

  beforeEach(() => {
    clickOracle = new Oracle(
      ['happy'], // contextFeatures
      ['short', 'relax'], // exerciseFeatures
      testExerciseIds, // exerciseIds
      0.1,  // learningRate
      true, // contextExerciseInteractions
      true,   // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      0.5, // negativeClassWeight
      'clicked', 
    );

    likingOracle = new Oracle(
      [], // contextFeatures
      [], // exerciseFeatures
      testExerciseIds, // exerciseIds
      0.1, // learningRate
      true, // contextExerciseInteractions
      true, // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      1.0, // negativeClassWeight
      'liking', // targetLabel
    );

    helpfulnessOracle = new Oracle(
      [], // contextFeatures
      [], // exerciseFeatures
      testExerciseIds, // exerciseIds
      0.1, // learningRate
      true, // contextExerciseInteractions
      true, // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      1.0, // negativeClassWeight
      'helpfulness', // targetLabel
    );
    // new list of exercises with only exercises with exercideId in ['articles_act', 'follow_your_breath']
    const testExercises = Exercises.filter(exercise => {
      return testExerciseIds.includes(exercise.ExerciseId);
    });

    recommendationEngine = new RecommendationEngine(
      clickOracle, // clickOracle
      likingOracle, //  likingOracle
      helpfulnessOracle, // helpfulnessOracle
      testExercises, // exercises
      1.0, // softmaxBeta
      0.7, // clickWeight
      0.15, // likingWeight
      0.15, // helpfulnessWeight
      3, // nRecommendations
    );
  });

  describe('constructor', () => {
    it('should create an instance of RecommendationEngine with the correct properties', () => {
      expect(recommendationEngine.clickOracle).toEqual(clickOracle);
      expect(recommendationEngine.likingOracle).toEqual(likingOracle);
      expect(recommendationEngine.helpfulnessOracle).toEqual(helpfulnessOracle);
      expect(recommendationEngine.softmaxBeta).toEqual(1.0);
      expect(recommendationEngine.clickWeight).toEqual(0.7);
      expect(recommendationEngine.likingWeight).toEqual(0.15);
      expect(recommendationEngine.helpfulnessWeight).toEqual(0.15);
      expect(recommendationEngine.nRecommendations).toEqual(3);
    });
  });

  describe('getRecommendationEngineState', () => {
    it('should return the correct state', () => {
      const state: IRecommendationEngineState = {
        clickOracleState: clickOracle.getOracleState(),
        likingOracleState: likingOracle.getOracleState(),
        helpfulnessOracleState: helpfulnessOracle.getOracleState(),
        softmaxBeta: 1.0,
        clickWeight: 0.7,
        likingWeight: 0.15,
        helpfulnessWeight: 0.15,
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
        likingOracleState: likingOracle.getOracleState(),
        helpfulnessOracleState: helpfulnessOracle.getOracleState(),
        softmaxBeta: 1.0,
        clickWeight: 0.7,
        likingWeight: 0.15,
        helpfulnessWeight: 0.15,
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
    const context: IContext = createDefaultContext();
    context.happy = 1;
    let recommendation: IRecommendation;
    beforeEach(() => {
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
      context = createDefaultContext();
      context.happy = 1;
      recommendation = recommendationEngine.makeRecommendation(context);
    });
    it('the weights of the clickOracle should be changed', () => {
      const oldClickWeights = recommendationEngine.clickOracle.weights;
      recommendationEngine.onCloseRecommendations(recommendation);
      expect(recommendationEngine.clickOracle.weights).not.toEqual(
        oldClickWeights,
      );
    });
    it('the weights of the likingOracle should not be changes', () => {
      const oldLikingWeights = recommendationEngine.likingOracle.weights;
      recommendationEngine.onCloseRecommendations(recommendation);
      expect(recommendationEngine.likingOracle.weights).toEqual(
        oldLikingWeights,
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
      context = createDefaultContext();
      context.happy = 1;
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
    it('the weights of the likingOracle should not be changesd', () => {
      const oldLikingWeights = recommendationEngine.likingOracle.weights;
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        chosenExerciseId,
      );
      expect(recommendationEngine.likingOracle.weights).toEqual(
        oldLikingWeights,
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
        likingOracleState: likingOracle.getOracleState(),
        helpfulnessOracleState: helpfulnessOracle.getOracleState(),
        softmaxBeta: 1.0,
        clickWeight: 0.7,
        likingWeight: 0.15,
        helpfulnessWeight: 0.15,
        nRecommendations: 3,
      };
      expect(recommendationEngine.toJSON()).toEqual(JSON.stringify(state));
    });
  });
});

describe('DemoRecommendationEngine', () => {
  let clickOracle: Oracle;
  let likingOracle: Oracle;
  let helpfulnessOracle: Oracle;
  let demoRecommendationEngine: DemoRecommendationEngine;
  const testExerciseIds = ['follow_your_breath', 'alternate_nostril_breathing'];

  beforeEach(() => {
    clickOracle = new Oracle(
      ['happy'], // contextFeatures
      ['short', 'relax'], // exerciseFeatures
      testExerciseIds, // exerciseIds
      0.1,  // learningRate
      true, // contextExerciseInteractions
      true,   // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      0.5, // negativeClassWeight
      'clicked', 
    );

    likingOracle = new Oracle(
      [], // contextFeatures
      [], // exerciseFeatures
      testExerciseIds, // exerciseIds
      0.1, // learningRate
      true, // contextExerciseInteractions
      true, // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      1.0, // negativeClassWeight
      'liking', // targetLabel
    );

    helpfulnessOracle = new Oracle(
      [], // contextFeatures
      [], // exerciseFeatures
      testExerciseIds, // exerciseIds
      0.1, // learningRate
      true, // contextExerciseInteractions
      true, // contextExerciseFeatureInteractions
      true, // useInversePropensityWeighting
      1.0, // negativeClassWeight
      'helpfulness', // targetLabel
    );
    // new list of exercises with only exercises with exercideId in ['articles_act', 'follow_your_breath']
    const testExercises = Exercises.filter(exercise => {
      return testExerciseIds.includes(
        exercise.ExerciseId,
      );
    });

    demoRecommendationEngine = new DemoRecommendationEngine(
      clickOracle, // clickOracle
      likingOracle, // likingOracle
      helpfulnessOracle, // helpfulnessOracle
      testExercises, // exercises
      1.0, // softmaxBeta
      0.7, // clickWeight
      0.15, // likingWeight
      0.15, // helpfulnessWeight
      3, // nRecommendations
    );
  });

  describe('scoreAllExercises', () => {
    it('should return the correct scores', () => {
      const context: IContext = createDefaultContext();
      context.happy = 1;
      const scoredExercises: IScoredExercise[] =
        demoRecommendationEngine.scoreAllExercises(context);
      const expectedScores: IScoredExercise[] = [
        {
          ExerciseId: 'alternate_nostril_breathing',
          ExerciseName: "Alternate nostril breathing",
          AggregateScore: 0.5,
          ClickScore: 0.5,
          Probability: 0.5,
          LikingScore: 0.5,
          HelpfulnessScore: 0.5,
          SelectedCount: undefined,
        },
        {
          AggregateScore: 0.5,
          ClickScore: 0.5,
          ExerciseId: 'follow_your_breath',
          ExerciseName: 'Follow Your Breath',
          Probability: 0.5,
          LikingScore: 0.5,
          HelpfulnessScore: 0.5,
          SelectedCount: undefined,
        },
      ];
      expect(scoredExercises).toEqual(expectedScores);
    });
  });
});
