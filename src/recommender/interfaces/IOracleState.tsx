export type WeightsHash = {[feature: string]: number};
export type FeaturesHash = {[feature: string]: number};

export type IOracleState = {
  contextFeatures: string[];
  exerciseFeatures: string[];
  exerciseIds: string[];
  learningRate: number;
  iterations: number;
  addIntercept: boolean;
  contextExerciseInteractions: boolean;
  contextExerciseFeatureInteractions: boolean;
  useInversePropensityWeighting: boolean;
  useInversePropensityWeightingPositiveOnly: boolean;
  targetLabel: string;
  weights: WeightsHash;
};
