// https://github.com/javascript-machine-learning/logistic-regression-gradient-descent-javascript/blob/master/src/index.js
let math = require('mathjs');


export class LogisticRoomOracle {

    // math = math.create(); // create a math object and assign it to a class property

    constructor(features, learningRate=0.1, iterations=1, theta) {
      this.features = features;
      if (undefined == theta) {
        this.theta = this.zeroWeights(this.features.length);
      }
      else {
        this.theta = theta;
      }
      this.learningRate = learningRate;
      this.iterations = iterations;
      
      this.nFeatures = this.features.length;
    }

    sigmoid(z) {
        return math.evaluate(`1 ./ (1 + e.^-z)`, {z});
    }
    
    zeroWeights(nFeatures) {
        return Array(nFeatures+1).fill().map(() => [0]);
    }

    getThetaHash(round=3) {
      const result = {};
      result['intercept'] = Number(this.theta[0]).toFixed(round);
      this.features.forEach((key, i) => {
        result[key] = Number(this.theta[i+1]).toFixed(round);
      });
      return result;
    }

    reorderHash(hash, keys) {
      const result = {};
      keys.forEach(key => {
        if (hash.hasOwnProperty(key)) {
          result[key] = hash[key];
        }
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
    
    getOrderedInputsArray(inputs_hash) {
        // if inputs_hash does not contain self.features keys, then abort:
        if (!this.hashContainsAllKeys(inputs_hash, this.features)) {
            throw new Error(`Inputs hash does not contain all features`);
        }
        // reorder inputs_hash to match self.features order:
        inputs_hash = this.reorderHash(inputs_hash, this.features);
        // convert inputs_hash to array and add intercept:
        return [[1, ...Object.values(inputs_hash)]]
    }

    fit(inputs_hash, label, learningRate, iterations) {
        if (learningRate === undefined) {learningRate = this.learningRate;}
        if (iterations === undefined) {iterations = this.iterations;}
        
        let X = this.getOrderedInputsArray(inputs_hash)
        let y = [label]
        
        for (let i = 0; i < iterations; i++) {
          let pred = this.sigmoid(math.evaluate(`X * theta`, {X, theta:this.theta}));
          this.theta = math.evaluate(
            `theta - learningRate / 1 * ((pred - y)' * X)'`, 
            {theta:this.theta, learningRate, pred, y, X}
          );
        }
    }

    fit_multiple(inputs, labels, learningRate, iterations){
      // loop over inputs, labels pairs and call fit on each pair:
      for (let i = 0; i < inputs.length; i++) {
        this.fit(inputs[i], labels[i], learningRate, iterations);
      }
    }
  
    // Method to make predictions with the trained model
    predict(inputs_hash) {
      let X = this.getOrderedInputsArray(inputs_hash)
      return this.sigmoid(math.evaluate(`X * theta`, {X, theta:this.theta}));
    }
  }

