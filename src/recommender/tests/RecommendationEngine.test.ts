import {Oracle} from '../Oracle';
import {
  RecommendationEngine,
  DemoRecommendationEngine,
} from '../RecommendationEngine';
import {IRecommendationEngineState} from '../interfaces/IRecommendationEngine';
import {IScoredExercise} from '../interfaces/IExercise';
import {IContext, createDefaultContext, processContext, IProcessedContext} from '../interfaces/IContext';
import {Exercises} from '../interfaces/Exercises';
import {IEvaluation, IRecommendation, IRecommendedExercise} from '../interfaces';


describe('RecommendationEngine', () => {
  let clickOracle: Oracle;
  let likingOracle: Oracle;
  let helpfulnessOracle: Oracle;
  let recommendationEngine: RecommendationEngine;
  const testExerciseIds = ['positive_self_talk', 'follow_your_breath', 'alternate_nostril_breathing'];

  beforeEach(() => {
    clickOracle = new Oracle(
      ['positive'], // contextFeatures
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

  describe('_filteredExerciseIds', () => {
    it('should return the correct list of exercises with default context', () => {
      const context: IContext = createDefaultContext();

      const filteredExerciseIds = recommendationEngine._filteredExerciseIds(context);
      expect(filteredExerciseIds.length).toEqual(3);
      expect(filteredExerciseIds.sort()).toEqual(testExerciseIds.sort());
    });

    it('should exclude follow_your_breath when context.sad >= 4', () => {
      const context: IContext = createDefaultContext();
      context.sad = 4;

      const filteredExerciseIds = recommendationEngine._filteredExerciseIds(context);
      expect(filteredExerciseIds.length).toEqual(2);
      expect(filteredExerciseIds.sort()).toEqual(['positive_self_talk', 'alternate_nostril_breathing'].sort());
    });

    it('only breathing or relaxation exercises and when context.frustrated >= 4 and context.stressed >= 4', () => {
      const context: IContext = createDefaultContext();
      context.frustrated = 4;
      context.stressed = 4;

      const filteredExerciseIds = recommendationEngine._filteredExerciseIds(context);
      expect(filteredExerciseIds.length).toEqual(2);
      expect(filteredExerciseIds.sort()).toEqual(['follow_your_breath', 'alternate_nostril_breathing'].sort());
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
    context.happy = 5;
    const processedContext = processContext(context)
    let recommendation: IRecommendation;
    beforeEach(() => {
      recommendation = recommendationEngine.makeRecommendation(context);
    });

    it('recommendation should contain three recommendations', () => {
      expect(recommendation.recommendedExercises.length).toEqual(3);
    });
    it('recommendation context should equal input context', () => {
      expect(recommendation.context).toEqual(processedContext);
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

  describe('onChooseExerciseDirectly', () => {
    it('the weights of the clickOracle should be changed', () => {
      const oldClickWeights = recommendationEngine.clickOracle.weights;
      recommendationEngine.onChooseExerciseDirectly('positive_self_talk');  
      expect(recommendationEngine.clickOracle.weights).not.toEqual(
        oldClickWeights,
      );
    });
  });

  describe('onCloseRecommendations', () => {
    let context: IContext;
    let recommendation: IRecommendation;
    beforeEach(() => {
      context = createDefaultContext();
      context.happy = 5; context.energetic = 5; context.relaxed= 5;
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
    it('expect the clickOracle weight for each positive*exerciseId in recommendedExercises to be decreased', () => {
      const oldClickWeights = recommendationEngine.clickOracle.getWeightsHash();
      recommendationEngine.onCloseRecommendations(recommendation);
      recommendation.recommendedExercises.forEach(rec => {
        const interactionKey = `positive*${rec.exerciseId}`;
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
      context.happy = 5; context.energetic = 5; context.relaxed= 5;
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
    it('expect the clickOracle weight for each positive*exerciseId in recommendedExercises to increased for the chosen exerciseId', () => {
      const oldClickWeights =
        recommendationEngine.clickOracle.getWeightsHash();
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        chosenExerciseId,
      );
      recommendation.recommendedExercises.forEach(rec => {
        const interactionKey = `positive*${rec.exerciseId}`;
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

  describe('onEvaluateExercise', () => {
    let context: IContext;
    let processedContext: IProcessedContext;
    let recommendation: IRecommendation;
    let chosenExerciseId: string;
    let evaluation: IEvaluation;
    beforeEach(() => {
      context = createDefaultContext();
      context.happy = 5; context.energetic = 5; context.relaxed= 5;
      processedContext = processContext(context);
      recommendation = recommendationEngine.makeRecommendation(context);
      chosenExerciseId = recommendation.recommendedExercises[0].exerciseId;
      evaluation = {
        liked: 100,
        helpful: 100,
      };
    });
    it('the weights of the clickOracle should not be changed', () => {
      const oldClickWeights = recommendationEngine.clickOracle.weights;
      recommendationEngine.onEvaluateExercise(
        processedContext,
        context,
        chosenExerciseId,
        evaluation,
      );
      expect(recommendationEngine.clickOracle.weights).toEqual(
        oldClickWeights,
      );
    });
    it('the weights of the likingOracle should be changed', () => {
      const oldLikingWeights = recommendationEngine.likingOracle.weights;
      recommendationEngine.onEvaluateExercise(
        processedContext,
        context,
        chosenExerciseId,
        evaluation,
      );
      expect(recommendationEngine.likingOracle.weights).not.toEqual(
        oldLikingWeights,
      );
    });

    it('the weights of the helpfulnessOracle should be changed', () => {
      const oldHelpfulnessWeights = recommendationEngine.helpfulnessOracle.weights;
      recommendationEngine.onEvaluateExercise(
        processedContext,
        context,
        chosenExerciseId,
        evaluation,
      );
      expect(recommendationEngine.helpfulnessOracle.weights).not.toEqual(
        oldHelpfulnessWeights,
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
});

describe('DemoRecommendationEngine', () => {
  let clickOracle: Oracle;
  let likingOracle: Oracle;
  let helpfulnessOracle: Oracle;
  let demoRecommendationEngine: DemoRecommendationEngine;
  const testExerciseIds = ['positive_self_talk', 'follow_your_breath', 'alternate_nostril_breathing'];

  beforeEach(() => {
    clickOracle = new Oracle(
      ['positive'], // contextFeatures
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
          Probability: 0.3333333333333333,
          LikingScore: 0.5,
          HelpfulnessScore: 0.5,
          SelectedCount: undefined,
        },
        {
          AggregateScore: 0.5,
          ClickScore: 0.5,
          ExerciseId: 'positive_self_talk',
          ExerciseName: 'Positive Self Talk',
          Probability: 0.3333333333333333,
          LikingScore: 0.5,
          HelpfulnessScore: 0.5,
          SelectedCount: undefined,
        },
        {
          AggregateScore: 0.5,
          ClickScore: 0.5,
          ExerciseId: 'follow_your_breath',
          ExerciseName: 'Follow Your Breath',
          Probability: 0.3333333333333333,
          LikingScore: 0.5,
          HelpfulnessScore: 0.5,
          SelectedCount: undefined,
        },
      ];
      expect(scoredExercises).toEqual(expectedScores);
    });
  });

  describe('getRecommendedExercises', () => {
    it('should return the correct recommended exercises', () => {
      const context: IContext = createDefaultContext();
      const recommendation: IRecommendation =
        demoRecommendationEngine.makeRecommendation(context);
      const recommendedExercises: IRecommendedExercise[] = recommendation.recommendedExercises;
      const expectedRecommendedExercises: IRecommendedExercise[] = [
        {
          exerciseId: 'follow_your_breath',
          score: 0.5,
          probability: 0.3333333333333333,
        },
        {
          exerciseId: 'positive_self_talk',
          score: 0.5,
          probability: 0.3333333333333333,
        },
        {
          exerciseId: 'alternate_nostril_breathing',
          score: 0.5,
          probability: 0.3333333333333333,
        },
      ];
      expect(recommendedExercises).toEqual(expect.arrayContaining(expectedRecommendedExercises.map(exercise => expect.objectContaining(exercise))));
    });
  });
});
