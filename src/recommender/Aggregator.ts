import { CosineSimilarity } from './MathService';

export interface IDemographics {
   male: number,
   master: number,
   international: number,
}


export interface IDemographicWeights {
    demographics: IDemographics,
    weights: Record<string, number>,
    numUpdates: Record<string, number>,
}

export function emptyDemographicWeights(demographics: IDemographics): IDemographicWeights {
    return {
        demographics,
        weights: {},
        numUpdates: {},
    }
}

// all possible demographics:
let allDemographics: IDemographics[] = [];
for(let maleVal of [-1,1]) {
    for(let masterVal of [-1,1]) {
        for(let internationalVal of [-1,1]) {
            const demographics:IDemographics = {
                    male: maleVal,
                    master: masterVal,
                    international: internationalVal,
                }

            allDemographics.push(demographics);
        }
    }
}
let allDemographicWeights = allDemographics.map((demographics) => emptyDemographicWeights(demographics));

const CastOrderedDemographicToNumArray = (demographic: IDemographics): number[] => {
    const result: number[] = [];
    const features = Object.keys(demographic);
    features.sort((a: string, b: string) => (a.localeCompare(b)))
    for (let index = 0; index < features.length; index++) {
        const element = features[index];
        result.push(demographic[element as keyof typeof demographic]);
    }
    // console.log("CastOrderedDemographicToNumArray", result)
    return result
}

function getDemographicDistance (
    demographic1:IDemographics, 
    demographic2: IDemographics
    ): number {
    const distance = CosineSimilarity(
        CastOrderedDemographicToNumArray(demographic1), 
        CastOrderedDemographicToNumArray(demographic2),
    )
    let result = isNaN(distance) ? 0 : distance;
    result = Math.abs((result + 1)/2); // normalize frin [-1, 1] to [0,1]
    return result
}

// export function WeightAggregatorFromJSON(json: string): WeightAggregator {
//     const data = JSON.parse(json)
//     const result = new WeightAggregator(
//         data.aggregateWeights,
//         data.numUpdates,
//         data.decay,
//         data.demographicWeights,
//     )
//     return result
// }

export class WeightAggregator {
    private aggregateWeights: Record<string, number> = {};
    private numUpdates: Record<string, number>;
    private decay = 0.95;
    private demographicWeights: IDemographicWeights[] = [];

    constructor(
        initialAggregateWeights: Record<string, number> = {},
        initialNumUpdates: Record<string, number> = {},
        decay: number=0.95,
        initialDemographWeights: IDemographicWeights[] = []
    ) {
        this.aggregateWeights = initialAggregateWeights;
        this.numUpdates = initialNumUpdates;
        this.decay = decay
        this.demographicWeights = initialDemographWeights;
    }

    toJSON(): string {
        return JSON.stringify({
            aggregateWeights: this.aggregateWeights,
            numUpdates: this.numUpdates,
            decay: this.decay,
            demographicWeights: this.demographicWeights,
        });
    }

    static fromJSON(json: string): WeightAggregator {
        const data = JSON.parse(json)
        return new WeightAggregator(
            data.aggregateWeights,
            data.numUpdates,
            data.decay,
            data.demographicWeights,
        )
    }
  
    private _updateWeights(
        oldWeights: Record<string, number>, 
        newWeights: Record<string, number>,
        decay: number,
        numUpdates: Record<string, number>,
        sampleWeight:number = 1,
        ): [Record<string, number>, Record<string, number>] {
      if (sampleWeight < 0 || sampleWeight > 1) {
            throw new Error("sampleWeight must be between 0 and 1");
        }
      for (const [key, value] of Object.entries(newWeights)) {
        if (key in oldWeights) {
          // if 1/numupdates is smaller than 1-decay then use 1/numupdates:
          const minDecay = Math.min(decay, 1- (1 / (numUpdates[key] + 1)));
          const weightedDecay = 1 - (1-minDecay) * sampleWeight;

          // Update existing weight using a moving average
          oldWeights[key] = weightedDecay * oldWeights[key] + (1 - weightedDecay) * value;
          numUpdates[key]++;
        } else {
          // Initialize new weight
          oldWeights[key] = value;
          numUpdates[key] = 1;
        }
      }
      return [oldWeights, numUpdates];
    }

    public updateAllWeights(demographics: IDemographics, newWeights: Record<string, number>): void {
        // Update aggregate weights
        const [updatedWeights, updatedNumUpdates] = this._updateWeights(
            this.aggregateWeights,  newWeights, this.decay, this.numUpdates, 1);
        this.aggregateWeights = updatedWeights;
        this.numUpdates = updatedNumUpdates;

        for (let i = 0; i < this.demographicWeights.length; i++) {
            const demographicWeight = this.demographicWeights[i];
            const sampleWeight = getDemographicDistance(demographics, demographicWeight.demographics)
            // console.log(sampleWeight)
            const [updatedWeights, updatedNumUpdates] = this._updateWeights(
                demographicWeight.weights,
                newWeights,
                this.decay,
                demographicWeight.numUpdates,
                sampleWeight, 
            );
            demographicWeight.weights = updatedWeights;
            demographicWeight.numUpdates = updatedNumUpdates;
        }
    }

    private _valueRounder(key:any, value:number) {
        if (typeof value === "number") {
          return parseFloat(value.toFixed(3));
        }
        return value;
      }
      
    private _roundObj(obj: Object): Object {
        return JSON.parse(JSON.stringify(obj, this._valueRounder, 2));
    }

    logWeights(): void {
        console.log(this._roundObj(this.aggregateWeights));
        for(let demographicWeight of this.demographicWeights) {
            console.log(demographicWeight.demographics, this._roundObj(demographicWeight.weights));
        }
    }
    
  }

for(let demo1 of allDemographics) {
    let distances: string = "";
    for(let demo2 of allDemographics) {
        // round to 3 digits:
        distances += " " + getDemographicDistance(demo1, demo2).toFixed(3)
    }
    console.log(distances);
}

const aggregator = new WeightAggregator(
    {}, {}, 0.95, 
    allDemographicWeights,
);

for (let i = 0; i < 100; i++) {
  aggregator.updateAllWeights(
    { male: 1, master: -1, international: 1 }, { a: 1, b: 2, c: 3 });
  aggregator.updateAllWeights(
    { male: -1, master: 1, international: 1 }, { a: 2, b: 1, c: 3 });
  aggregator.updateAllWeights(
    { male: -1, master: 1, international: -1 }, { a: 1, b: 2, c: 1 });
}

aggregator.logWeights();
console.log(aggregator.toJSON());

WeightAggregator.fromJSON(aggregator.toJSON()).logWeights();