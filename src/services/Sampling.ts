import { IExcercise, IExcerciseFeatures } from "../interfaces";

// export const ExerciseMathService = (exercises: IExcercise[], softmaxBeta: number = 2) => {

const p_ConvertToProbabilityDistribution = (scores: number[], softmaxBeta: number): number[] => {
    let probabilities: number[] = []
    let softmaxDenomenator = 0
    const softmaxNumerators: number[] = []
    for (let i = 0; i < scores.length; i++) {
        let softmaxNumerator = Math.exp(softmaxBeta * scores[i]);
        softmaxDenomenator += softmaxNumerator
        softmaxNumerators.push(softmaxNumerator);
    }

    for (let i = 0; i < softmaxNumerators.length; i++) {
        probabilities.push(softmaxNumerators[i] / softmaxDenomenator)
    }
    return probabilities;
}

const p_SampledIndexFromProbabilityDistribution = (probs: number[]): number => {
    const sum = probs.reduce((a, b) => a + b, 0); // [1,2,3,4] = cumulative sum ie. 1+2+3+4=10
    if (sum <= 0) {
        throw Error('probs must sum to a value greater than zero')
    }
    const normalized = probs.map(prob => prob / sum) // [1,2,3,4] = transform ie. [0.111, 0.234, 0.114, 0.578]
    const sample = Math.random() // 0.4
    let total = 0
    for (let i = 0; i < normalized.length; i++) {
        total += normalized[i] // 0.
        if (sample < total) { // 0.4 < 0.111?
            return i
        }
    }
    return -1;
}

//https://stackoverflow.com/questions/51362252/javascript-cosine-similarity-function
const p_CosineSimilarity = (A: number[], B: number[]) => {
    var dotproduct = 0;
    var mA = 0;
    var mB = 0;
    for (let i = 0; i < A.length; i++) { // here you missed the i++
        dotproduct += (A[i] * B[i]);
        mA += (A[i] * A[i]);
        mB += (B[i] * B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct) / ((mA) * (mB)) // here you needed extra brackets
    return similarity;
}

const p_CastOrderedFeatureToNumArray = (exercise_feature: IExcerciseFeatures): number[] => {
    const result: number[] = [];
    const features = Object.keys(exercise_feature);
    features.sort((a: string, b: string) => (a.localeCompare(b)))
    for (let index = 0; index < features.length; index++) {
        const element = features[index];
        result.push(exercise_feature[element as keyof typeof exercise_feature]);
    }
    return result
}

export function getCosineDistance (exercises:IExcercises[], exercise: IExcercise
    ): { exercise: IExcercise, distance: number }[] {
    let result: { exercise: IExcercise, distance: number }[] = []
    let current_ex_value = p_CastOrderedFeatureToNumArray(exercise.Features)
    exercises.forEach((ex) => {
        const ex_value = p_CastOrderedFeatureToNumArray(ex.Features)
        const distance = p_CosineSimilarity(current_ex_value, ex_value)
        result.push({
            exercise: ex,
            distance: distance
        })
    })

    result.sort((a, b) => (a.distance - b.distance));
    return result
}

export function getSoftmaxSample(
    exercises: IExcercise[], 
    softmaxBeta: number = 2,
 ) : {exercise: IExcercise, index: number} {
    const scores = exercises.map(s => s.PenalizedScore);
    if (scores == undefined) {
        throw "Fatal error. Scores was undefined while computing recommendation."
    }
    const probabilities = p_ConvertToProbabilityDistribution(scores as number[], softmaxBeta);
    for (let i = 0; i < exercises.length; i++) {
        exercises[i].PenalizedProbability = probabilities[i];
    }
    const recommendedExIndex = p_SampledIndexFromProbabilityDistribution(probabilities);
    //set probability of each exercise in exercise equal to the probability in probabilities:
    
    return { 
        exercise: exercises[recommendedExIndex], 
        index: recommendedExIndex, 
    }
}