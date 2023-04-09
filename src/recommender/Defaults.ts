import { IOracleState, IRecommendationEngineState, exerciseIds } from "./interfaces"

const DefaultClickOracle: IOracleState = {
    contextFeatures: ['happy', 'sad'],
    exerciseFeatures: [ 
        'three_five_mins',
        'five_seven_mins',
        'seven_ten_mins',
        // 'defuse',
        // 'zoom_out',
        // 'feeling_stressed',
        // 'feeling_angry',
        'mood_boost',
        'self_compassion',
        'relax',
        'energize',
        // 'feeling_anxious',
        'grounding',
        // 'feeling_blue',
        'focus',
        'shift_perspective',
        'introspect',
        'breathing',
        'article',
        'ACT',
        'Mindfulness',
        'Relaxation',
        'PositivePsychology',
    ],
    exerciseIds: exerciseIds,
    learningRate: 0.1,
    contextExerciseInteractions: true,
    contextExerciseFeatureInteractions: true,
    useInversePropensityWeighting: true,
    negativeClassWeight: 0.5,
    targetLabel: 'clicked',
    weights: {'intercept': -0.7},
}

const DefaultRatingOracle: IOracleState = {
    contextFeatures: ['happy', 'sad'],
    exerciseFeatures: [ 
        'ACT',
        'Mindfulness',
        'Relaxation',
        'PositivePsychology',
    ],
    exerciseIds: exerciseIds,
    learningRate: 2.0,
    contextExerciseInteractions: true,
    contextExerciseFeatureInteractions: false,
    useInversePropensityWeighting: false,
    negativeClassWeight: 1.0,
    targetLabel: 'rating',
    weights: {},
}

const DefaultRecommendationEngine: IRecommendationEngineState = {
    clickOracleState: DefaultClickOracle,
    ratingOracleState: DefaultRatingOracle,
    softmaxBeta: 2.0,
    ratingWeight: 0.2,
    nRecommendations: 3,
}


export { DefaultClickOracle, DefaultRatingOracle, DefaultRecommendationEngine }
