// https://github.com/javascript-machine-learning/logistic-regression-gradient-descent-javascript/blob/master/src/index.js
let math = require('mathjs');

// TODO
// - add context * activity features interactions - DONE
// - add inverse propensity score weighting - DONE

export class LogisticOracle {

    constructor(
        contextFeatures, 
        activityFeatures, 
        learningRate=0.1, 
        iterations=1, 
        addIntercept=true, 
        useInversePropensityWeighting=true,
        theta) {
      this.contextFeatures = contextFeatures;
      this.activityFeatures = activityFeatures;
      if (this.contextFeatures == undefined){this.contextFeatures = []}
      if (this.activityFeatures == undefined){this.activityFeatures = []}

      this.allInputFeatures = [... this.contextFeatures, ... this.activityFeatures];
      // make list of combination of all contextFeatures and all activityFeatures (interaction features):
      this.interactionFeatures = [];
      for (let i = 0; i < this.contextFeatures.length; i++) {
        for (let j = 0; j < this.activityFeatures.length; j++) {
          this.interactionFeatures.push(this.contextFeatures[i] + '_' + this.activityFeatures[j]);
        }
      }
      this.features = [... this.allInputFeatures, ... this.interactionFeatures];
      // console.log("this.contextFeatures, this.activityFeatures, this.interactionFeatures", this.contextFeatures, this.activityFeatures, this.interactionFeatures)
      // console.log("this.allInputFeatures, this.features", this.allInputFeatures, this.features)
      
      this.addIntercept = addIntercept;
      if (this.addIntercept) {this.nFeatures = this.features.length + 1}
      else {this.nFeatures = this.features.length};
      if (undefined == theta) {
        this.theta = this.zeroWeights(this.nFeatures);
      }
      else if (theta.length == this.nFeatures) {
        this.theta = theta;
      }
      else {
        //abort due to size mismatch and display sizes in error  message:
        throw new Error(`Theta size mismatch: ${theta.length} != ${this.nFeatures}`);
      }
      this.learningRate = learningRate;
      this.iterations = iterations;
      this.useInversePropensityWeighting = useInversePropensityWeighting;
    }

    setlearningRate(learningRate) {
      this.learningRate = learningRate;
    }

    zeroWeights(nFeatures) {
        return Array(nFeatures).fill().map(() => [0]);
      }

    addInteractionFeatures(inputsHash) {
      for (let i = 0; i < this.contextFeatures.length; i++) {
        for (let j = 0; j < this.activityFeatures.length; j++) {
          inputsHash[this.contextFeatures[i] + '_' + this.activityFeatures[j]] = inputsHash[this.contextFeatures[i]] * inputsHash[this.activityFeatures[j]];
        }
      }
      return inputsHash;
    }
    
    getThetaMap(round=3) {
      const result = new Map;
      if (this.addIntercept) {result.set('intercept', Number(this.theta[0]).toFixed(round));}

      this.features.forEach((key, i) => {
        result.set(key, Number(this.theta[i+1]).toFixed(round));
      });
      return result;
    }

    hashContainsAllKeys(hash, keys) {
      for (let i = 0; i < keys.length; i++) {
        if (!hash.hasOwnProperty(keys[i])) {
          return false;
        }
      }
      return true;
    }

    getOrderedInputsArray(contextInputs, activityInputs) {
        let inputsHash = Object.assign({}, contextInputs, activityInputs);
        // console.log("getOrderedInputsArray inputsHash:", inputsHash, activityInputs);
        // if inputs_hash does not contain self.features keys, then abort:
        if (!this.hashContainsAllKeys(inputsHash, this.allInputFeatures)) {
            // throw error with missing features:
            let missingFeatures = [];
            this.allInputFeatures.forEach(feature => {
                if (!inputsHash.hasOwnProperty(feature)) {
                    missingFeatures.push(feature);
                }
            });
            throw new Error(`Missing features in inputsHash: ${missingFeatures}`);
        }
        inputsHash = this.addInteractionFeatures(inputsHash);
        // console.log("inputsHash with interactions:", inputsHash);
        inputsArray = [];
        if (this.addIntercept) {inputsArray.push(1);} // add intercept
        for (const feature of this.features) {
          inputsArray.push(inputsHash[feature]);
        }
        return [inputsArray]
    }

    sigmoid(z) {
        return math.evaluate(`1 ./ (1 + e.^-z)`, {z});
    }

     // Method to make predictions with the trained model
    predict(contextInputs, activityInputs) {
      let X = this.getOrderedInputsArray(contextInputs, activityInputs)
      // console.log("predict X", X)
      // console.log("this.theta", this.theta)
      return this.sigmoid(math.evaluate(`X * theta`, {X, theta:this.theta}))[0][0];
    }
    
    fit(trainingData, learningRate, iterations, useInversePropensityWeighting) {
        if (learningRate === undefined) {learningRate = this.learningRate;}
        if (iterations === undefined) {iterations = this.iterations;}
        if (useInversePropensityWeighting === undefined) {useInversePropensityWeighting = this.useInversePropensityWeighting;}
        // console.log("oracle fit trainingData", trainingData)
        let X = this.getOrderedInputsArray(
          trainingData.input.contextFeatures, 
          trainingData.input.exerciseFeatures,
        )
        let y = [trainingData.output.score]
        // console.log("X, y", X, y)
        // console.log("this.theta", this.theta)
        let weight = 1;
        if (this.useInversePropensityWeighting) {
          weight = 1 / Math.sqrt(trainingData.probability);
        }

        for (let i = 0; i < iterations; i++) {
          let pred = this.sigmoid(math.evaluate(`X * theta`, {X, theta:this.theta}));
          this.theta = math.evaluate(
            `theta - weight * learningRate / 1 * ((pred - y)' * X)'`, 
            {theta:this.theta, weight, learningRate, pred, y, X}
          );
        }
    }

    fit_multiple(trainingDataList, learningRate, iterations){
      // loop over inputs, labels pairs and call fit on each pair:
      for (let i = 0; i < trainingDataList.length; i++) {
        this.fit(trainingDataList[i], learningRate, iterations);
      }
    }
  
   
  }
