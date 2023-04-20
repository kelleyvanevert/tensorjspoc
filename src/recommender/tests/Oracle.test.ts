import {Oracle} from '../Oracle';
import {ITrainingData, IOracleState} from '../interfaces';

describe('Oracle', () => {
  const contextFeatures = ['context1', 'context2'];
  const exerciseFeatures = ['feature1', 'feature2'];
  const exerciseIds = ['exercise1', 'exercise2'];
  const learningRate = 0.1;
  const contextExerciseInteractions = false;
  const contextExerciseFeatureInteractions = true;
  const useInversePropensityWeighting = false;
  const targetLabel = 'label';
  const weights = {
    intercept: 0,
    exercise1: 0.1,
    exercise2: 0.2,
    feature1: 0.3,
    feature2: 0.4,
  };

  let oracle: Oracle;

  it('should throw error if contextFeatures is not an array', () => {
    expect(() => {
      new Oracle(
        'contextFeatures' as any,
        exerciseFeatures,
        exerciseIds,
        learningRate,
        contextExerciseInteractions,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        1.0,
        targetLabel,
        weights,
      );  
    }).toThrowError("Context features, exercise features, and exercise names must be arrays.");
  });


  it('should throw error if contextFeatures is not an array', () => {
    expect(() => {
      new Oracle(
        contextFeatures,
        'exerciseFeatures' as any,
        exerciseIds,
        learningRate,
        contextExerciseInteractions,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        1.0,
        targetLabel,
        weights,
      );  
    }).toThrowError("Context features, exercise features, and exercise names must be arrays.");
  });

  it('should throw error if contextFeatures is not an array', () => {
    expect(() => {
      new Oracle(
        contextFeatures,
        exerciseFeatures,
        'exerciseIds' as any,
        learningRate,
        contextExerciseInteractions,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        1.0,
        targetLabel,
        weights,
      );  
    }).toThrowError("Context features, exercise features, and exercise names must be arrays.");
  });

  it('should throw error if contextFeatures is not an array', () => {
    expect(() => {
      new Oracle(
        contextFeatures,
        exerciseFeatures,
        exerciseIds,
        'learningRate' as any,
        contextExerciseInteractions,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        1.0,
        targetLabel,
        weights,
      );  
    }).toThrowError("Learning rate must be a number.");
  });

  it('should throw error if contextFeatures is not an array', () => {
    expect(() => {
      new Oracle(
        contextFeatures,
        exerciseFeatures,
        exerciseIds,
        learningRate,
        'contextExerciseInteractions' as any,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        1.0,
        targetLabel,
        weights,
      );  
    }).toThrowError("Context-exercise interactions, context-exercise feature interactions, inverse propensity weighting must be booleans.");
  });

  beforeEach(() => {
    oracle = new Oracle(
      contextFeatures,
      exerciseFeatures,
      exerciseIds,
      learningRate,
      contextExerciseInteractions,
      contextExerciseFeatureInteractions,
      useInversePropensityWeighting,
      1.0,
      targetLabel,
      weights,
    );
  });

  describe('constructor', () => {
    it('should create an instance of LogisticOracle with the correct properties', () => {
      expect(oracle.contextFeatures).toEqual(contextFeatures);
      expect(oracle.exerciseFeatures).toEqual(exerciseFeatures);
      expect(oracle.exerciseIds).toEqual(exerciseIds);
      expect(oracle.learningRate).toEqual(learningRate);
      expect(oracle.addIntercept).toEqual(true);
      expect(oracle.contextExerciseInteractions).toEqual(
        contextExerciseInteractions,
      );
      expect(oracle.contextExerciseFeatureInteractions).toEqual(
        contextExerciseFeatureInteractions,
      );
      expect(oracle.useInversePropensityWeighting).toEqual(
        useInversePropensityWeighting,
      );
      expect(oracle.targetLabel).toEqual(targetLabel);
      expect(oracle.weights).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0, 0, 0, 0]);
    });
  });

  describe('getOracleState', () => {
    it('should return the correct state', () => {

      const expectedOracleState: IOracleState = {
        contextFeatures,
        exerciseFeatures,
        exerciseIds:exerciseIds,
        learningRate,
        contextExerciseInteractions,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        negativeClassWeight:1.0,
        targetLabel,
        weights: {
          "intercept": 0,
          "context1*feature1": 0,
          "context1*feature2": 0,
          "context2*feature1": 0,
          "context2*feature2": 0,
          "exercise1": 0.1,
          "exercise2": 0.2,
          "feature1": 0.3,
          "feature2": 0.4,
        },
      }

      expect(oracle.getOracleState()).toEqual(
        expectedOracleState,
      );
    });
  });

  describe('fromOracleState', () => {
    it('should return an instance of LogisticOracle with the correct properties', () => {
      const oracleState: IOracleState = {
        contextFeatures,
        exerciseFeatures,
        exerciseIds,
        learningRate,
        contextExerciseInteractions,
        contextExerciseFeatureInteractions,
        useInversePropensityWeighting,
        negativeClassWeight:1.0,
        targetLabel,
        weights: {
          "intercept": 0,
          "context1*feature1": 0,
          "context1*feature2": 0,
          "context2*feature1": 0,
          "context2*feature2": 0,
          "exercise1": 0.1,
          "exercise2": 0.2,
          "feature1": 0.3,
          "feature2": 0.4,
        },
      };
      const newOracle = Oracle.fromOracleState(oracleState);
      expect(newOracle.contextFeatures).toEqual(contextFeatures);
      expect(newOracle.exerciseFeatures).toEqual(exerciseFeatures);
      expect(newOracle.exerciseIds).toEqual(exerciseIds);
      expect(newOracle.learningRate).toEqual(learningRate);
      expect(newOracle.addIntercept).toEqual(true);
      expect(newOracle.contextExerciseInteractions).toEqual(
        contextExerciseInteractions);
      expect(newOracle.contextExerciseFeatureInteractions).toEqual(
        contextExerciseFeatureInteractions);
      expect(newOracle.useInversePropensityWeighting).toEqual(
        useInversePropensityWeighting);
      expect(newOracle.targetLabel).toEqual(targetLabel);
      expect(newOracle.weights).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0, 0, 0, 0]);
    });
  });

  describe('fromJSON', () => {
    it('should return an instance of LogisticOracle with the correct properties', () => {
      const newOracle = Oracle.fromJSON(oracle.toJSON());
      expect(newOracle.contextFeatures).toEqual(contextFeatures);
      expect(newOracle.exerciseFeatures).toEqual(exerciseFeatures);
      expect(newOracle.exerciseIds).toEqual(exerciseIds);
      expect(newOracle.learningRate).toEqual(learningRate);
      expect(newOracle.addIntercept).toEqual(true);
      expect(newOracle.contextExerciseInteractions).toEqual(
        contextExerciseInteractions);
      expect(newOracle.contextExerciseFeatureInteractions).toEqual(
        contextExerciseFeatureInteractions);
      expect(newOracle.useInversePropensityWeighting).toEqual(
        useInversePropensityWeighting);
      expect(newOracle.targetLabel).toEqual(targetLabel);
      expect(newOracle.weights).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0, 0, 0, 0]);
    });
  });

  describe('calculateNFeatures', () => {
    it('should return the correct number of features', () => {
      expect(oracle.calculateNFeatures()).toEqual(9);
    });

    it('should return the correct number of features when addIntercept is false', () => {
      oracle.addIntercept = false;
      expect(oracle.calculateNFeatures()).toEqual(8);
    });
  });

  describe('generateFeatures', () => {
    it('should return an array with all the features including interaction features', () => {
      expect(oracle.generateFeatures()).toEqual([
        'exercise1',
        'exercise2',
        'feature1',
        'feature2',
        'context1*feature1',
        'context1*feature2',
        'context2*feature1',
        'context2*feature2',
      ]);
    });
  });

  describe('generateInteractionFeatures', () => {
    it('should return an array with all the interaction features', () => {
      expect(oracle.generateInteractionFeatures()).toEqual([
        'context1*feature1',
        'context1*feature2',
        'context2*feature1',
        'context2*feature2',
      ]);
    });
  });

  describe('calculateNFeatures', () => {
    it('should return the correct number of features', () => {
      expect(oracle.calculateNFeatures()).toEqual(9);
    });
  });

  describe('zeroWeights', () => {
    it('should return an array of zeros with length equal to the specified input', () => {
      expect(oracle.zeroWeights(5)).toEqual([0, 0, 0, 0, 0]);
      expect(oracle.zeroWeights(0)).toEqual([]);
    });
  });

  describe('updateWeights', () => {
    it('should update the weights', () => {
      const newWeights = {exercise1: -0.1, exercise2: -0.2};
      const updatedWeights = oracle.updateWeights(newWeights);
      expect(updatedWeights).toEqual([0, -0.1, -0.2, 0.3, 0.4, 0, 0, 0, 0]);
    });

    it('should update the weights when addIntercept is false', () => {
      oracle.addIntercept = false;
      const newWeights = {exercise1: -0.1, exercise2: -0.2};
      const updatedWeights = oracle.updateWeights(newWeights);
      expect(updatedWeights).toEqual([-0.1, -0.2, 0.3, 0.4, 0, 0, 0, 0]);
    });
  });

  describe('setFeaturesAndUpdatedWeights', () => {
    it('should set the features and updated weights', () => {
      oracle.setFeaturesAndUpdateWeights(['context1']);
      expect(oracle.features).toEqual([
        'exercise1',
        'exercise2',
        'feature1',
        'feature2',
        'context1*feature1',
        'context1*feature2',
      ]);
    });
  });

  describe('getWeightsHash', () => {
    it('should return a hash of the weights', () => {
      expect(oracle.getWeightsHash()).toEqual({
        intercept: 0,
        exercise1: 0.1,
        exercise2: 0.2,
        feature1: 0.3,
        feature2: 0.4,
        'context1*feature1': 0,
        'context1*feature2': 0,
        'context2*feature1': 0,
        'context2*feature2': 0,
      });
    });
  });

  describe('getWeightsMap', () => {
    it('should return a hash of the weights', () => {
      expect(oracle.getWeightsMap()).toEqual(
        new Map([
          ['intercept', '0.000'],
          ['exercise1', '0.100'],
          ['exercise2', '0.200'],
          ['feature1', '0.300'],
          ['feature2', '0.400'],
          ['context1*feature1', '0.000'],
          ['context1*feature2', '0.000'],
          ['context2*feature1', '0.000'],
          ['context2*feature2', '0.000'],
        ]),
      );
    });
    it('should return a hash of the weights when addIntercept is false', () => {
      oracle.addIntercept = false;
      oracle.updateWeights(oracle.getWeightsHash())
      expect(oracle.getWeightsMap()).toEqual(
        new Map([
          ['exercise1', '0.100'],
          ['exercise2', '0.200'],
          ['feature1', '0.300'],
          ['feature2', '0.400'],
          ['context1*feature1', '0.000'],
          ['context1*feature2', '0.000'],
          ['context2*feature1', '0.000'],
          ['context2*feature2', '0.000'],
        ]),
      );
    });
  });

  describe('toJSON', () => {
    it('should return a JSON object with the correct properties', () => {
      expect(oracle.toJSON()).toEqual(
        "{\"contextFeatures\":[\"context1\",\"context2\"],\"exerciseFeatures\":[\"feature1\",\"feature2\"],\"exerciseIds\":[\"exercise1\",\"exercise2\"],\"learningRate\":0.1,\"contextExerciseInteractions\":false,\"contextExerciseFeatureInteractions\":true,\"useInversePropensityWeighting\":false,\"negativeClassWeight\":1,\"targetLabel\":\"label\",\"weights\":{\"intercept\":0,\"exercise1\":0.1,\"exercise2\":0.2,\"feature1\":0.3,\"feature2\":0.4,\"context1*feature1\":0,\"context1*feature2\":0,\"context2*feature1\":0,\"context2*feature2\":0}}"
      );
    });
  });

  describe('addExerciseNameFeatures', () => {
    it('should add the exercise name features to the features array', () => {
      const newInputsHash = oracle.addExerciseNameFeatures({}, 'exercise1');
      expect(newInputsHash).toEqual({exercise1: 1, exercise2: 0});
    });
    it('should not add the exercise name features to the features array if no exercise name is passed', () => {
      const newInputsHash = oracle.addExerciseNameFeatures({});
      expect(newInputsHash).toEqual({exercise1: 0, exercise2: 0});
    });
    it('should not add the exercise name features to the features array if the exercise name is not in the exerciseIds array', () => {
      const newInputsHash = oracle.addExerciseNameFeatures({}, 'exercise3');
      expect(newInputsHash).toEqual({exercise1: 0, exercise2: 0});
    });
  });

  describe('hashContainsAllKeys', () => {
    it('should return true if the hash contains all the keys', () => {
      const hash = {exercise1: 1, exercise2: 0};
      expect(
        oracle.hashContainsAllKeys(hash, ['exercise1', 'exercise2']),
      ).toEqual(true);
    });

    it('should return true if the hash contains all the keys or more', () => {
      const hash = {exercise1: 1, exercise2: 0, exercise3: 1};
      expect(
        oracle.hashContainsAllKeys(hash, ['exercise1', 'exercise2']),
      ).toEqual(true);
    });

    it('should return false if the hash does not contain all the keys', () => {
      const hash = {exercise1: 1};
      expect(
        oracle.hashContainsAllKeys(hash, ['exercise1', 'exercise2']),
      ).toEqual(false);
    });
    it('should return false if the hash is empty', () => {
      const hash = {};
      expect(
        oracle.hashContainsAllKeys(hash, ['exercise1', 'exercise2']),
      ).toEqual(false);
    });
  });

  describe('calculateInteractionFeatures', () => {
    it('should return an hash of interaction features', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined, // contextFeatures
        undefined, // exerciseFeatures
        undefined, // exerciseIds
        true, // contextExerciseInteractions
        true, // contextExerciseFeatureInteractions
      );
      const hash = {
        context1: 1,
        context2: 0,
        exercise1: 1,
        exercise2: 0,
        feature1: 1,
        feature2: 0,
      };

      expect(oracle.calculateInteractionFeatures(hash)).toEqual({
        context1: 1,
        context2: 0,
        exercise1: 1,
        exercise2: 0,
        feature1: 1,
        feature2: 0,
        'context1*feature1': 1,
        'context1*feature2': 0,
        'context2*feature1': 0,
        'context2*feature2': 0,
        'context1*exercise1': 1,
        'context1*exercise2': 0,
        'context2*exercise1': 0,
        'context2*exercise2': 0,
      });
    });
  });

  describe('getOrderedInputsArray', () => {
    let contextFeatures: Record<string, number>;
    let exerciseFeatures: Record<string, number>;

    beforeEach(() => {
      contextFeatures = {
        context1: 1,
        context2: 0,
      };
      exerciseFeatures = {
        feature1: 1,
        feature2: 0,
      };
    });

    it('should return an array of inputs in the correct order with only exercise interactions', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        true,
        false,
      );

      const exerciseName = 'exercise1';
      expect(
        oracle.getOrderedInputsArray(
          contextFeatures,
          exerciseFeatures,
          exerciseName,
        ),
      ).toEqual([[1, 1, 0, 1, 0, 1, 0, 0, 0]]);
    });

    it('should return an array of inputs in the correct order with only feature interactions', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        true,
        true,
      );
      const exerciseName = 'exercise1';
      expect(
        oracle.getOrderedInputsArray(
          contextFeatures,
          exerciseFeatures,
          exerciseName,
        ),
      ).toEqual([[1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0]]);
    });

    it('should return an array of inputs in the correct order with both exercise and feature interactions', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined, // contextFeatures
        undefined, // exerciseFeatures
        undefined, // exerciseIds
        true, // useFeatureInteractions
        true, // useExerciseInteractions
      );
      const exerciseName = 'exercise1';
      expect(
        oracle.getOrderedInputsArray(
          contextFeatures,
          exerciseFeatures,
          exerciseName,
        ),
      ).toEqual([[1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0]]);
    });

    it('should return an array of inputs in the correct order with no interactions', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      );
      const exerciseName = 'exercise1';
      expect(
        oracle.getOrderedInputsArray(
          contextFeatures,
          exerciseFeatures,
          exerciseName,
        ),
      ).toEqual([[1, 1, 0, 1, 0]]);
    });

    it('should return an array of inputs in the correct order with only feature interactions with exercise2', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        true,
        true,
      );
      const exerciseName = 'exercise2';
      expect(
        oracle.getOrderedInputsArray(
          contextFeatures,
          exerciseFeatures,
          exerciseName,
        ),
      ).toEqual([[1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0]]);
    });

    it('it should throw an error if there is a missing features', () => {
      oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        true,
        true,
      );
      const exerciseName = 'exercise2';
      delete contextFeatures.context1;
      expect(() =>
        oracle.getOrderedInputsArray(
          contextFeatures,
          exerciseFeatures,
          exerciseName,
        ),
      ).toThrowError('Missing features in inputsHash: ');
    });
  });

  describe('sigmoid', () => {
    it('should return 0.5 for 0', () => {
      expect(oracle.sigmoid(0)).toEqual(0.5);
    });
    it('should return 0.7310585786300049 for 1', () => {
      expect(oracle.sigmoid(1)).toEqual(0.7310585786300049);
    });
    it('should return 0.2689414213699951 for -1', () => {
      expect(oracle.sigmoid(-1)).toEqual(0.2689414213699951);
    });
  });

  describe('predict', () => {
    beforeEach(() => {
      oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        true,
        true,
        {feature1: 0, 'context1*feature1': 1, 'context1*exercise1': 1},
      );
    });
    it('should return 0.5 for all zero features', () => {
      const contextFeatures = {
        context1: 0,
        context2: 0,
      };
      const exerciseFeatures = {
        feature1: 0,
        feature2: 0,
      };
      const exerciseName = 'exercise3';
      expect(
        oracle.predict(contextFeatures, exerciseFeatures, exerciseName),
      ).toEqual(0.5);
    });
    it('should return 0.73 for all features that add up to 1', () => {
      const contextFeatures = {
        context1: 1,
        context2: 0,
      };
      const exerciseFeatures = {
        feature1: 1,
        feature2: 0,
      };
      const exerciseName = 'exercise3';
      expect(
        oracle.predictLogit(contextFeatures, exerciseFeatures, exerciseName),
      ).toEqual(1);
      expect(
        oracle.predict(contextFeatures, exerciseFeatures, exerciseName),
      ).toEqual(0.7310585786300049);
    });

    it('should return 0.73 for all features that add up to 1', () => {
      const contextFeatures = {
        context1: 1,
        context2: 0,
      };
      const exerciseFeatures = {
        feature1: -1,
        feature2: 0,
      };
      const exerciseName = 'exercise3';
      expect(
        oracle.predictLogit(contextFeatures, exerciseFeatures, exerciseName),
      ).toEqual(-1);
      expect(
        oracle.predict(contextFeatures, exerciseFeatures, exerciseName),
      ).toBeCloseTo(0.2689, 3);
    });
  });

  describe('fit', () => {
    it('should return an array of weights that are different from the previous weights', () => {
      let trainingData: ITrainingData = {
        input: {
          exerciseId: 'exercise1',
          contextFeatures: {context1: 1, context2: 0},
          exerciseFeatures: {feature1: 1, feature2: 0},
        },
        label: 1,
        probability: 0.5,
      };
      const oldWeights = oracle.weights;
      oracle.fit(trainingData as any);
      expect(oracle.weights).not.toEqual(oldWeights);

      const newWeights = oracle.getWeightsHash();
      expect(newWeights['exercise1']).toBeCloseTo(0.14, 2);
    });
  });

  describe('fitMany', () => {
    it('should update weights after passing training data', () => {
      let trainingData: ITrainingData[] = [
        {
          input: {
            exerciseId: 'exercise1',
            contextFeatures: {context1: 1, context2: 0},
            exerciseFeatures: {feature1: 1, feature2: 0},
          },
          label: 1,
          probability: 0.5,
        },
        {
          input: {
            exerciseId: 'exercise1',
            contextFeatures: {context1: 1, context2: 0},
            exerciseFeatures: {feature1: 1, feature2: 0},
          },
          label: 1,
          probability: 0.5,
        },
      ];

      const oldWeights = oracle.weights;
      oracle.fitMany(trainingData as any);
      expect(oracle.weights).not.toEqual(oldWeights);

      const newWeights = oracle.getWeightsHash();
      expect(newWeights['exercise1']).toBeCloseTo(0.18, 2);
    });
  });
});
