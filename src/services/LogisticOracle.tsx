let math = require('mathjs');
import { ITrainingData } from '../interfaces';


export function LogisticOracleFromJSON(json: string): LogisticOracle {
  let data = JSON.parse(json);
  return new LogisticOracle(
    data.contextFeatures,
    data.exerciseFeatures,
    data.learningRate,
    data.iterations,
    data.addIntercept,
    data.useInversePropensityWeighting,
    data.theta
  );
}

export class LogisticOracle {
  contextFeatures: string[];
  exerciseFeatures: string[];
  exerciseNames: string[];
  learningRate: number;
  iterations: number;
  addIntercept: boolean;
  useInversePropensityWeighting: boolean;
  theta: number[];

  allInputFeatures: string[];
  interactionFeatures: string[];
  features: string[];
  nFeatures: number;

  constructor(
    contextFeatures: string[] = [],
    exerciseFeatures: string[] = [],
    exerciseNames: string[] = [],
    learningRate = 0.1,
    iterations = 1,
    addIntercept = true,
    useInversePropensityWeighting = true,
    theta?: number[]
  ) {
    this.contextFeatures = contextFeatures;
    this.exerciseFeatures = exerciseFeatures;
    this.exerciseNames = exerciseNames;
    this.addIntercept = addIntercept;

    this.allInputFeatures = [...this.contextFeatures, ...this.exerciseFeatures];
    this.interactionFeatures = this.generateInteractionFeatures()
    this.features = this.generateFeatures();
    this.nFeatures = this.generateNFeatures();
  
    if (theta === undefined) {
      this.theta = this.zeroWeights(this.nFeatures);
    } else if (theta.length == this.nFeatures) {
      this.theta = theta;
    } else {
      // abort due to size mismatch and display sizes in error message:
      throw new Error(`Theta size mismatch: ${theta.length} != ${this.nFeatures}`);
    }

    this.learningRate = learningRate;
    this.iterations = iterations;
    this.useInversePropensityWeighting = useInversePropensityWeighting;
  }

  generateFeatures(): string[] {
    let features = [...this.exerciseNames, ...this.exerciseFeatures, ...this.interactionFeatures];
    return features
  }

  generateInteractionFeatures(): string[] {
    let interactionFeatures = [];
    for (let i = 0; i < this.contextFeatures.length; i++) {
      for (let j = 0; j < this.exerciseFeatures.length; j++) {
        interactionFeatures.push(this.contextFeatures[i] + '*' + this.exerciseFeatures[j]);
      }
    }
    return interactionFeatures
  }

  generateNFeatures(): number {
    if (this.addIntercept) {
      return this.features.length + 1;
    } else {
      return this.features.length;
    }
  }

  updateTheta(oldTheta: number[], oldFeatures:string[], newFeatures: string[]): number[] {
    let newTheta: number[] = [];
    let baseIndex = 0;
    if (this.addIntercept) {
      newTheta.push(oldTheta[0]);
      baseIndex = 1;
    }
    for (let i = 0; i < newFeatures.length; i++) {
      if (oldFeatures.includes(newFeatures[i])) {
        let oldIndex = oldFeatures.indexOf(newFeatures[i]);
        newTheta.push(oldTheta[baseIndex + oldIndex]);
      } else {
        newTheta.push(0);
      }
    }
    console.log('updateTheta', oldFeatures, newFeatures)
    console.log('updateTheta', oldTheta, newTheta, oldTheta.length, newTheta.length)
    return newTheta;
  }

  updateFeatures(contextFeatures: string[] = [], exerciseFeatures: string[] = []): void {
    this.contextFeatures = contextFeatures;
    this.exerciseFeatures = exerciseFeatures;
    this.allInputFeatures = [...this.contextFeatures, ...this.exerciseFeatures];
    this.interactionFeatures = this.generateInteractionFeatures()
    const oldFeatures = this.features;
    this.features = this.generateFeatures();
    this.theta = this.updateTheta(this.theta, oldFeatures, this.features);
    this.nFeatures = this.generateNFeatures();
  }

  toJSON(): string {
    return JSON.stringify({
      contextFeatures: this.contextFeatures,
      exerciseFeatures: this.exerciseFeatures,
      theta: this.theta,
      learningRate: this.learningRate,
      iterations: this.iterations,
      addIntercept: this.addIntercept,
      useInversePropensityWeighting: this.useInversePropensityWeighting,
      features: this.features,
    });
  }

  setlearningRate(learningRate: number): void {
    this.learningRate = learningRate;
  }

  zeroWeights(nFeatures: number): number[] {
    return Array(nFeatures)
      .fill()
      .map(() => [0])
      .flat();
  }

  addInteractionFeatures(inputsHash: Record<string, number>): Record<string, number> {
    for (let i = 0; i < this.contextFeatures.length; i++) {
      for (let j = 0; j < this.exerciseFeatures.length; j++) {
        inputsHash[this.contextFeatures[i] + '*' + this.exerciseFeatures[j]] =
          inputsHash[this.contextFeatures[i]] * inputsHash[this.exerciseFeatures[j]];
      }
    }
    return inputsHash;
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
    
  getThetaMap(round: number = 3): Map<string, string> {
    const result = new Map<string, string>();
    if (this.addIntercept) {
      result.set('intercept', Number(this.theta[0]).toFixed(round));
      this.features.forEach((key: string, i: number) => {
        result.set(key, Number(this.theta[i + 1]).toFixed(round));
      });
    } else {
      this.features.forEach((key: string, i: number) => {
        result.set(key, Number(this.theta[i]).toFixed(round));
      });
    }
    return result;
  }

  hashContainsAllKeys(hash: { [key: string]: any }, keys: string[]): boolean {
    for (let i = 0; i < keys.length; i++) {
      if (!hash.hasOwnProperty(keys[i])) {
        return false;
      }
    }
    return true;
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
    inputsHash = this.addInteractionFeatures(inputsHash);
    inputsHash = this.addExerciseNameFeatures(inputsHash, exerciseName);
    // console.log("inputsHash with interactions:", inputsHash);
    const inputsArray: number[] = [];
    if (this.addIntercept) {inputsArray.push(1);} // add intercept
    for (const feature of this.features) {
        inputsArray.push(inputsHash[feature]);
    }
    return [inputsArray];
  }

  sigmoid(z: number) {
    return math.evaluate(`1 ./ (1 + e.^-z)`, {z});
  }

  predict(contextInputs: any, exerciseInputs: any, exerciseName: string | undefined): number {
    let X = this.getOrderedInputsArray(contextInputs, exerciseInputs, exerciseName);
    console.log("predict X:", X, contextInputs, exerciseInputs, this.theta);
    let pred = this.sigmoid(
      math.evaluate(`X * theta`, { X, theta: this.theta })
    )[0];
    return pred;
  }

  predictLogit(contextInputs: any, exerciseInputs: any, exerciseName: string | undefined): number {
    let X = this.getOrderedInputsArray(contextInputs, exerciseInputs, exerciseName);
    
    let logit = math.evaluate(`X * theta`, { X, theta: this.theta })[0];
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
    let y = [trainingData.label];

    let weight = 1;
    if ((useInversePropensityWeighting) && (trainingData.label == 1)) {
      weight = 1 / Math.sqrt(trainingData.probability || 1);
    }

    for (let i = 0; i < iterations; i++) {
      let pred = this.sigmoid(
        math.evaluate(`X * theta`, { X, theta: this.theta })
      );
      this.theta = math.evaluate(
        `theta - weight * learningRate / 1 * ((pred - y)' * X)'`,
        { theta: this.theta, weight, learningRate, pred, y, X }
      );
    }
  }

  fitMultiple(
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
