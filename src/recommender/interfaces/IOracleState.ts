export type WeightsHash = {[feature: string]: number};
export type FeaturesHash = {[feature: string]: number};

export type IOracleState = {
  contextFeatures: string[];
  exerciseFeatures: string[];
  exerciseIds: string[];
  learningRate: number;
  contextExerciseInteractions: boolean;
  contextExerciseFeatureInteractions: boolean;
  useInversePropensityWeighting: boolean;
  negativeClassWeight: number;
  targetLabel: string;
  weights: WeightsHash;
};
