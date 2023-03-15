import { IExcercise, IExcerciseFeatures } from "../interfaces";

export const ExerciseMathService = (exercises: IExcercise[], softmax_beta: number = 2) => {

    const p_ConvertToProbabilityDistribution = (scores: number[], softmax: number): number[] => {
        let probabilities: number[] = []
        let softmax_denomenator = 0
        const numerators: number[] = []
        for (let i = 0; i < scores.length; i++) {
            let softmax_numerator = Math.exp(softmax * scores[i]);
            softmax_denomenator += softmax_numerator
            numerators.push(softmax_numerator);
        }

        for (let i = 0; i < numerators.length; i++) {
            probabilities.push(numerators[i] / softmax_denomenator)
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

    const getCosineDistance = (exercise: IExcercise): { exercise: IExcercise, distance: number }[] => {
        let result: { exercise: IExcercise, distance: number }[] = []
        let current_ex_value = p_CastOrderedFeatureToNumArray(exercise.Value)
        exercises.forEach((ex) => {
            const ex_value = p_CastOrderedFeatureToNumArray(ex.Value)
            const distance = p_CosineSimilarity(current_ex_value, ex_value)
            result.push({
                exercise: ex,
                distance: distance
            })
        })

        result.sort((a, b) => (a.distance - b.distance));
        return result
    }

    const getSampleFromProbabilityDistributedScores = (): { exercise: IExcercise, index: number } => {
        const scores = exercises.map(s => s.Score);
        if (scores == undefined) {
            throw "Fatal error. Scores was undefined while computing recommendation."
        }
        const probabilities = p_ConvertToProbabilityDistribution(scores as number[], softmax_beta);
        const recommendedExIndex = p_SampledIndexFromProbabilityDistribution(probabilities);
        return { exercise: exercises[recommendedExIndex], index: recommendedExIndex }
    }

    return {
        getSampleFromProbabilityDistributedScores,
        getCosineDistance
    }
}