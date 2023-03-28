let math = require('mathjs');
import { ITrainingData } from '../interfaces';


// TODO:
// - [x] add interactions between contextFeatures and exerciseNames
// - [ ] update interactions with bools

export function LogisticOracleFromJSON(json: string): LogisticOracle {
  let data = JSON.parse(json);
  return new LogisticOracle(
    data.contextFeatures,
    data.exerciseFeatures,
    data.exerciseNames,
    data.learningRate,
    data.iterations,
    data.addIntercept,
    data.contextExerciseInteractions,
    data.contextExerciseFeatureInteractionse,
    data.useInversePropensityWeighting,
    data.useInversePropensityWeightingPositiveOnly,
    data.weights
  );
}

export class LogisticOracle {
  contextFeatures: string[];
  exerciseFeatures: string[];
  exerciseNames: string[];
  learningRate: number;
  iterations: number;
  addIntercept: boolean;
  contextExerciseInteractions: boolean;
  contextExerciseFeatureInteractions: boolean;
  useInversePropensityWeighting: boolean;
  useInversePropensityWeightingPositiveOnly: boolean;
  weights: number[];

  allInputFeatures: string[];
  interactionFeatures: string[];
  features: string[];
  nFeatures: number;
  targetLabel: string = 'label';

  constructor(
    contextFeatures: string[] = [],
    exerciseFeatures: string[] = [],
    exerciseNames: string[] = [],
    learningRate = 0.1,
    iterations = 1,
    addIntercept = true,
    contextExerciseInteractions: boolean = false,
    contextExerciseFeatureInteractions: boolean = true,
    useInversePropensityWeighting = false,
    useInversePropensityWeightingPositiveOnly = false,
    targetLabel: string = 'label',
    weights: Object = {},
  ) {

    // console.log("contextExerciseInteractions", contextExerciseInteractions)
    this.setFeaturesAndUpdateWeights(
      contextFeatures, 
      exerciseFeatures, 
      exerciseNames, 
      addIntercept, 
      contextExerciseInteractions, 
      contextExerciseFeatureInteractions,
      weights
    );
    this.targetLabel = targetLabel;
    this.learningRate = learningRate;
    this.iterations = iterations;
    this.useInversePropensityWeighting = useInversePropensityWeighting;
    this.useInversePropensityWeightingPositiveOnly = useInversePropensityWeightingPositiveOnly
  }

  generateFeatures(): string[] {
    let features = [...this.exerciseNames, ...this.exerciseFeatures, ...this.interactionFeatures];
    return features
  }

  generateInteractionFeatures(): string[] {
    let interactionFeatures = [];
    if (this.contextExerciseInteractions) {
      for (let i = 0; i < this.contextFeatures.length; i++) {
        for (let j = 0; j < this.exerciseNames.length; j++) {
          interactionFeatures.push(this.contextFeatures[i] + '*' + this.exerciseNames[j]);
        }
      }
    }
    if (this.contextExerciseFeatureInteractions) {
      for (let i = 0; i < this.contextFeatures.length; i++) {
        for (let j = 0; j < this.exerciseFeatures.length; j++) {
          interactionFeatures.push(this.contextFeatures[i] + '*' + this.exerciseFeatures[j]);
        }
      }
    }
    return interactionFeatures
  }

  calculateNFeatures(): number {
    if (this.addIntercept) {
      return this.features.length + 1;
    } else {
      return this.features.length;
    }
  }

  zeroWeights(nFeatures: number): number[] {
    return Array(nFeatures)
      .fill()
      .map(() => [0])
      .flat();
  }

  updateWeights(newWeights: Object = {}): number[] {
    this.weights = this.zeroWeights(this.nFeatures);
    if (this.addIntercept) {
      this.weights[0] = (newWeights as any)['intercept'] || this.weights[0];
      for (let i = 0; i < this.features.length; i++) {
        this.weights[i+1] = (newWeights as any)[this.features[i]] || this.weights[i+1];
      }
    } else {
      for (let i = 0; i < this.features.length; i++) {
        this.weights[i] = (newWeights as any)[this.features[i]] || this.weights[i];
      }
    }
    return this.weights
  }

  setFeaturesAndUpdateWeights(
      contextFeatures?: string[], 
      exerciseFeatures?: string[],
      exerciseNames?: string[],
      addIntercept?: boolean,
      contextExerciseInteractions?: boolean,
      contextExerciseFeatureInteractions?: boolean,
      weights: Object = {},
      ): void {
    this.contextFeatures = contextFeatures ?? this.contextFeatures;
    this.exerciseFeatures = exerciseFeatures ?? this.exerciseFeatures;
    this.exerciseNames = exerciseNames ?? this.exerciseNames;
    this.addIntercept = addIntercept ?? this.addIntercept;
    this.contextExerciseInteractions = contextExerciseInteractions ?? this.contextExerciseInteractions;
    this.contextExerciseFeatureInteractions = contextExerciseFeatureInteractions ?? this.contextExerciseFeatureInteractions;
    
    this.allInputFeatures = [...this.contextFeatures, ...this.exerciseFeatures];
    this.interactionFeatures = this.generateInteractionFeatures()
    this.features = this.generateFeatures();
    this.nFeatures = this.calculateNFeatures();
    const combinedWeights = {...this.getWeightsHash(), ...weights}
    this.weights = this.updateWeights(combinedWeights);
  }

  getWeightsHash() : Record<string, number> {
    if (this.weights == undefined) {return {}}
    const result = {};
    if (this.addIntercept) {
      (result as any) ['intercept'] = this.weights[0];
    }
    if (this.features !== undefined) {
      this.features.forEach((key: string, i: number) => {
        (result as any)[key] = this.weights[i + 1];
      });
    }
    return result;
  }

  getWeightsMap(round: number = 3): Map<string, string> {
    const result = new Map<string, string>();
    if (this.addIntercept) {
      result.set('intercept', Number(this.weights[0]).toFixed(round));
      this.features.forEach((key: string, i: number) => {
        result.set(key, Number(this.weights[i + 1]).toFixed(round));
      });
    } else {
      this.features.forEach((key: string, i: number) => {
        result.set(key, Number(this.weights[i]).toFixed(round));
      });
    }
    return result;
  }

  toJSON(): string {
    return JSON.stringify({
      contextFeatures: this.contextFeatures,
      exerciseFeatures: this.exerciseFeatures,
      exerciseNames: this.exerciseNames,      
      learningRate: this.learningRate,
      iterations: this.iterations,
      addIntercept: this.addIntercept,
      contextExerciseInteractions: this.contextExerciseInteractions,
      contextExerciseFeatureInteractions: this.contextExerciseFeatureInteractions,
      useInversePropensityWeighting: this.useInversePropensityWeighting,
      useInversePropensityWeightingPositiveOnly: this.useInversePropensityWeightingPositiveOnly,
      features: this.features,
      weights: this.getWeightsHash(),
    });
  }

  addExerciseNameFeatures(
    inputsHash: Record<string, number>, 
    exercisename: string |undefined = undefined
    ): Record<string, number> {
    for (let i = 0; i < this.exerciseNames.length; i++) {
      if (this.exerciseNames[i] === exercisename) {
        inputsHash[this.exerciseNames[i]] = 1;
      } else {
        inputsHash[this.exerciseNames[i]] = 0;
      }
    }
    return inputsHash;
  }

  hashContainsAllKeys(hash: { [key: string]: any }, keys: string[]): boolean {
    for (let i = 0; i < keys.length; i++) {
      if (!hash.hasOwnProperty(keys[i])) {
        return false;
      }
    }
    return true;
  }

  calculateInteractionFeatures(inputsHash: Record<string, number>): Record<string, number> {
    if (this.contextExerciseInteractions) {
      for (let i = 0; i < this.contextFeatures.length; i++) {
        for (let j = 0; j < this.exerciseNames.length; j++) {
          inputsHash[this.contextFeatures[i] + '*' + this.exerciseNames[j]] = 
            inputsHash[this.contextFeatures[i]] * inputsHash[this.exerciseNames[j]];
        }
      }
    }
    if (this.contextExerciseFeatureInteractions) {
      for (let i = 0; i < this.contextFeatures.length; i++) {
        for (let j = 0; j < this.exerciseFeatures.length; j++) {
          inputsHash[this.contextFeatures[i] + '*' + this.exerciseFeatures[j]] =
            inputsHash[this.contextFeatures[i]] * inputsHash[this.exerciseFeatures[j]];
        }
      }
    }
    return inputsHash;
  }

  getOrderedInputsArray(
    contextInputs: Record<string, number>, 
    exerciseInputs: Record<string, number>,
    exerciseName: string | undefined = undefined,
    ): number[][] {
    let inputsHash: Record<string, number> = {...contextInputs, ...exerciseInputs};
    // console.log("getOrderedInputsArray inputsHash:", inputsHash, exerciseInputs);
    if (!this.hashContainsAllKeys(inputsHash, this.allInputFeatures)) {
        // throw error with missing features:
        const missingFeatures: string[] = [];
        this.allInputFeatures.forEach(feature => {
            if (!inputsHash.hasOwnProperty(feature)) {
                missingFeatures.push(feature);
            }
        });
        throw new Error(`Missing features in inputsHash: ${missingFeatures}`);
    }
    inputsHash = this.addExerciseNameFeatures(inputsHash, exerciseName);
    inputsHash = this.calculateInteractionFeatures(inputsHash);
    
    const inputsArray: number[] = [];
    if (this.addIntercept) {inputsArray.push(1);}
    for (const feature of this.features) {
        inputsArray.push(inputsHash[feature]);
    }
    return [inputsArray];
  }

  sigmoid(z: number) {
    return math.evaluate(`1 ./ (1 + e.^-z)`, {z});
  }

  predictLogit(contextInputs: any, exerciseInputs: any, exerciseName: string | undefined): number {
    let X = this.getOrderedInputsArray(contextInputs, exerciseInputs, exerciseName);
    
    let logit = math.evaluate(`X * weights`, { X, weights: this.weights })[0];
    return logit;
  }

  predictProba(contextInputs: any, exerciseInputs: any, exerciseName: string | undefined): number {    
    let logit = this.predictLogit(contextInputs, exerciseInputs, exerciseName);
    let proba = this.sigmoid(logit);
    return proba;
  }

  fit(
    trainingData: ITrainingData,
    learningRate: number | undefined,
    iterations: number | undefined,
    useInversePropensityWeighting: boolean | undefined,
  ) {
    if (learningRate == undefined) {
      learningRate = this.learningRate;
    }
    if (iterations == undefined) {
      iterations = this.iterations;
    }
    if (useInversePropensityWeighting == undefined) {
      useInversePropensityWeighting = this.useInversePropensityWeighting;
    }

    let X = this.getOrderedInputsArray(
      trainingData.input.contextFeatures,
      trainingData.input.exerciseFeatures,
      trainingData.input.exerciseName,
    );
    let y = [(trainingData as any)[this.targetLabel]];
    if (y[0] != undefined) {
      let sampleWeight = 1;
      if (useInversePropensityWeighting) {
        sampleWeight = 1 / (trainingData.probability || 1);
      } else if ((this.useInversePropensityWeightingPositiveOnly) && (trainingData.clicked == 1)) {
        sampleWeight = 1 / (trainingData.probability || 1);
      }

      for (let i = 0; i < iterations; i++) {
        let pred = this.sigmoid(
          math.evaluate(`X * weights`, { X, weights: this.weights })
        );
        this.weights = math.evaluate(
          `weights - sampleWeight * learningRate / 1 * ((pred - y)' * X)'`,
          { weights: this.weights, sampleWeight: sampleWeight, learningRate, pred, y, X }
        );
      }
    } else {
      console.log("fit: no target label found in trainingData:", trainingData);
    }
  }

  fitMany(
    trainingDataList: ITrainingData[], 
    learningRate: number | undefined,
    iterations: number | undefined,
    useInversePropensityWeighting: boolean | undefined,
    ) {
    for (let i = 0; i < trainingDataList.length; i++) {
      this.fit(trainingDataList[i], learningRate, iterations, useInversePropensityWeighting);
    }
  }

  
}
