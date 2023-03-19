let math = require('mathjs');
import { ITrainingData } from '../interfaces';


export function LogisticOracleFromJSON(json: string): LogisticOracle {
  let data = JSON.parse(json);
  return new LogisticOracle(
    data.contextFeatures,
    data.activityFeatures,
    data.learningRate,
    data.iterations,
    data.addIntercept,
    data.useInversePropensityWeighting,
    data.theta
  );
}

export class LogisticOracle {
  contextFeatures: string[];
  activityFeatures: string[];
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
    contextFeatures: string[],
    activityFeatures: string[],
    learningRate = 0.1,
    iterations = 1,
    addIntercept = true,
    useInversePropensityWeighting = true,
    theta?: number[]
  ) {
    this.contextFeatures = contextFeatures;
    this.activityFeatures = activityFeatures;

    if (this.contextFeatures === undefined) {
      this.contextFeatures = [];
    }

    if (this.activityFeatures === undefined) {
      this.activityFeatures = [];
    }

    this.allInputFeatures = [...this.contextFeatures, ...this.activityFeatures];

    // make list of combination of all contextFeatures and all activityFeatures (interaction features):
    this.interactionFeatures = [];
    for (let i = 0; i < this.contextFeatures.length; i++) {
      for (let j = 0; j < this.activityFeatures.length; j++) {
        this.interactionFeatures.push(this.contextFeatures[i] + '*' + this.activityFeatures[j]);
      }
    }

    this.features = [...this.activityFeatures, ...this.interactionFeatures];

    this.addIntercept = addIntercept;
    if (this.addIntercept) {
      this.nFeatures = this.features.length + 1;
    } else {
      this.nFeatures = this.features.length;
    }

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

  toJSON(): string {
    return JSON.stringify({
      contextFeatures: this.contextFeatures,
      activityFeatures: this.activityFeatures,
      theta: this.theta,
      learningRate: this.learningRate,
      iterations: this.iterations,
      addIntercept: this.addIntercept,
      useInversePropensityWeighting: this.useInversePropensityWeighting,
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
      for (let j = 0; j < this.activityFeatures.length; j++) {
        inputsHash[this.contextFeatures[i] + '*' + this.activityFeatures[j]] =
          inputsHash[this.contextFeatures[i]] * inputsHash[this.activityFeatures[j]];
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

  getOrderedInputsArray(contextInputs: Record<string, number>, activityInputs: Record<string, number>): number[][] {
    let inputsHash: Record<string, number> = {...contextInputs, ...activityInputs};
    // console.log("getOrderedInputsArray inputsHash:", inputsHash, activityInputs);
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

  predict(contextInputs: any, activityInputs: any): number {
    let X = this.getOrderedInputsArray(contextInputs, activityInputs);
    
    let pred = this.sigmoid(
      math.evaluate(`X * theta`, { X, theta: this.theta })
    )[0];//[0];
    console.log("predict", X[0].length, this.theta.length, pred)
    return pred;
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
      trainingData.input.exerciseFeatures
    );
    let y = [trainingData.output.score];

    let weight = 1;
    if ((useInversePropensityWeighting) && (trainingData.output.score == 1)) {
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

  fit_multiple(trainingDataList: ITrainingData[], learningRate: number, iterations: number) {
    for (let i = 0; i < trainingDataList.length; i++) {
      this.fit(trainingDataList[i], learningRate, iterations);
    }
  }
}
