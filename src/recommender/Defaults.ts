import {
  IOracleState,
  IRecommendationEngineState,
  exerciseIds,
} from "./interfaces";

const DefaultClickOracle: IOracleState = {
  contextFeatures: [
    "evening",
    "weekend",
    "happy", 
    "sad",
    // "stressed",
    // "energetic",
    // "stressed",
    // "fatigued",
  ],
  exerciseFeatures: [
    "short",
    "medium",
    "long",
    "be_more_present",
    "relax",
    "be_kinder_to_myself",
    "increase_positive_feelings",
    "manage_difficult_thoughts_and_feelings",
    "focus_on_what_matters_to_me",
    "visualisation",
    "savouring",
    "breathing",
    "reframing",
    "defusing",
    "grounding",
    "audio_guided_exercise",
    "audio_only",
    "notebook_exercise",
    "outdoors",
    "private_location",
    "in_the_room_already",
  ],
  exerciseIds: exerciseIds,
  learningRate: 0.01,
  contextExerciseInteractions: true,
  contextExerciseFeatureInteractions: true,
  useInversePropensityWeighting: true,
  negativeClassWeight: 0.5,
  targetLabel: "clicked",
  weights: {intercept: -0.7},
};

const DefaultLikingOracle: IOracleState = {
  contextFeatures: [
    "evening",
    "weekend",
    // "happy", 
    // "sad",
    // "stressed",
    // "energetic",
    // "stressed",
    // "fatigued",
  ],
  exerciseFeatures: [
    "short",
    "medium",
    "long",
    "be_more_present",
    "relax",
    "be_kinder_to_myself",
    "increase_positive_feelings",
    "manage_difficult_thoughts_and_feelings",
    "focus_on_what_matters_to_me",
    "visualisation",
    "savouring",
    "breathing",
    "reframing",
    "defusing",
    "grounding",
    "audio_guided_exercise",
    "audio_only",
    "notebook_exercise",
    "outdoors",
    "private_location",
    "in_the_room_already",
  ],
  exerciseIds: exerciseIds,
  learningRate: 2.0,
  contextExerciseInteractions: true,
  contextExerciseFeatureInteractions: false,
  useInversePropensityWeighting: false,
  negativeClassWeight: 1.0,
  targetLabel: "liking",
  weights: {},
};

const DefaultHelpfulnessOracle: IOracleState = {
  contextFeatures: [
    "evening",
    "weekend",
    // "happy", 
    // "sad",
    // "stressed",
    // "energetic",
    // "stressed",
    // "fatigued",
  ],
  exerciseFeatures: [
    "short",
    "medium",
    "long",
    "be_more_present",
    "relax",
    "be_kinder_to_myself",
    "increase_positive_feelings",
    "manage_difficult_thoughts_and_feelings",
    "focus_on_what_matters_to_me",
    "visualisation",
    "savouring",
    "breathing",
    "reframing",
    "defusing",
    "grounding",
    "audio_guided_exercise",
    "audio_only",
    "notebook_exercise",
    "outdoors",
    "private_location",
    "in_the_room_already",
  ],
    exerciseIds: exerciseIds,
    learningRate: 2.0,
    contextExerciseInteractions: true,
    contextExerciseFeatureInteractions: false,
    useInversePropensityWeighting: false,
    negativeClassWeight: 1.0,
    targetLabel: "helpfulness",
    weights: {},
  };

const DefaultRecommendationEngine: IRecommendationEngineState = {
  clickOracleState: DefaultClickOracle,
  likingOracleState: DefaultLikingOracle,
  helpfulnessOracleState: DefaultHelpfulnessOracle,
  softmaxBeta: 5.0,
  clickWeight: 0.7,
  likingWeight: 0.15,
  helpfulnessWeight: 0.15,
  nRecommendations: 3,
};

export { DefaultClickOracle, DefaultLikingOracle, DefaultHelpfulnessOracle, DefaultRecommendationEngine };
