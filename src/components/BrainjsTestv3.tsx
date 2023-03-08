import React, { useEffect, useState } from 'react';
// @ts-ignore
import brain from 'brain.js/browser';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { FlatList } from 'react-native-gesture-handler';
import { TrainingData, IExcercise, IExcerciseFeatures, YesNo, MoodIndex, Exercises } from '../interfaces';
import { BaseColors } from './colors';

export function BrainJsTestv3() {
    const softmax_beta = 2;
    const exercises: IExcercise[] = Exercises

    const [trainingData, setTrainingData] = useState<IExcerciseFeatures[]>([]);
    const [net, setNeuralNetwork] = useState<brain.NeuralNetwork>(new brain.NeuralNetwork({
        activation: 'sigmoid',
        hiddenLayers: [4]
    }));
    const [mood, setMood] = useState<MoodIndex>(MoodIndex.SoSo);
    const [recommendation, setRecommendation] = useState<{ recommendation1: IExcercise, recommendation2: IExcercise, recommendation3: IExcercise }>();
    const [modelRecommendations, setModelRecommendations] = useState<IExcercise[]>()

    useEffect(() => {
        const trainingData: TrainingData = {
            input: {
                mood_index: MoodIndex.SoSo,
                three_five_mins: YesNo.No,
                five_seven_mins: YesNo.No,
                seven_ten_mins: YesNo.Yes,
                deffuse: YesNo.No,
                zoom_out: YesNo.No,
                feeling_stressed: YesNo.No,
                feeling_angry: YesNo.No,
                mood_boost: YesNo.No,
                self_compassion: YesNo.No
            },
            output: { score: 1 },
        }
        net.train(trainingData);
        compute_recommendation();
        setTrainingData([trainingData.input])
    }, []);

    const compute_recommendation = () => {
        const computedReccommendation: IExcercise[] = []
        for (let index = 0; index < exercises.length; index++) {
            const exercise = exercises[index];
            exercise.Value.mood_index = mood;
            exercise.Score = net.run(exercise.Value).score
            computedReccommendation.push(exercise)
        }

        const sortedRecommendation: IExcercise[] = computedReccommendation.sort((a, b) => (b.Score || 0) - (a.Score || 0));
        setModelRecommendations(sortedRecommendation);

        const sortedRecommendationCopy = sortedRecommendation.slice()
        let recommendationArray: IExcercise[] = []
        for (let index = 0; index < 3; index++) {
            const scores = sortedRecommendationCopy.map(s => s.Score);
            if (scores == undefined) {
                throw "Fatal error. Scores was undefined while computing recommendation."
            }
            const probs = convertToProbabilityDistribution(scores as number[]);
            const recommendedExIndex = sampleFromProbabilityDistribution(probs);
            recommendationArray[index] = sortedRecommendationCopy[recommendedExIndex];
            const removedItem = sortedRecommendationCopy.splice(recommendedExIndex, 1)
        }

        setRecommendation({
            recommendation1: recommendationArray[0],
            recommendation2: recommendationArray[1],
            recommendation3: recommendationArray[2],
        })
    }

    const convertToProbabilityDistribution = (scores: number[]): number[] => {
        let probabilities: number[] = []
        let softmax_denomenator = 0
        const numerators: number[] = []
        for (let i = 0; i < scores.length; i++) {
            let softmax_numerator = Math.exp(softmax_beta * scores[i]);
            softmax_denomenator += softmax_numerator
            numerators.push(softmax_numerator);
        }

        for (let i = 0; i < numerators.length; i++) {
            probabilities.push(numerators[i] / softmax_denomenator)
        }
        return probabilities;
    }

    const sampleFromProbabilityDistribution = (probs: number[]): number => {
        const sum = probs.reduce((a, b) => a + b, 0); // [1,2,3,4] = cumulative sum ie. 1+2+3+4=10
        if (sum <= 0) {
            throw Error('probs must sum to a value greater than zero')
        }
        const normalized = probs.map(prob => prob / sum) // [1,2,3,4] = transform ie. [1/10, 2/10, 3/10, 4/10]
        const sample = Math.random()
        let total = 0
        for (let i = 0; i < normalized.length; i++) {
            total += normalized[i]
            if (sample < total) {
                return i
            }
        }
        return -1;
    }

    // const btnRating = (rating: number) => {
    //     let current_exercise: IExcercise | undefined = exercises.find((curr: IExcercise) => curr.InternalName == recommendation?.InternalName)
    //     if (current_exercise == undefined) {
    //         throw "Could not find recommendation!"
    //     }

    //     if (mood !== undefined) {
    //         current_exercise.Value.mood_index = mood
    //     }

    //     let newData: TrainingData = {
    //         input: current_exercise.Value,
    //         output: {
    //             score: rating
    //         }
    //     }

    //     setTrainingData([...(trainingData || []), newData.input]);
    //     net.train(newData);
    //     compute_recommendation();
    // }

    const selectRecommendation = (recommendation: IExcercise | undefined) => {
        if (recommendation == undefined) {
            throw "Recommendation is undefined. Cannot execute function selectRecommendation."
        }
    }

    const setCurrentMood = (mood: MoodIndex) => setMood(mood)

    return (
        <View>
            <AppButton style={style.button} title="Are you feeling so so?" onPress={() => setCurrentMood(0)}></AppButton>
            <AppButton style={style.button} title="Are you feeling depressed?" onPress={() => setCurrentMood(1)}></AppButton>
            <Text style={style.title}>Mood: {MoodIndex[mood]}</Text>

            <AppButton
                style={style.button}
                title={recommendation?.recommendation1.DisplayName || 'undefined'}
                onPress={() => selectRecommendation(recommendation?.recommendation1)}></AppButton>
            <AppButton
                style={style.button}
                title={recommendation?.recommendation2.DisplayName || 'undefined'}
                onPress={() => selectRecommendation(recommendation?.recommendation2)}></AppButton>
            <AppButton
                style={style.button}
                title={recommendation?.recommendation3.DisplayName || 'undefined'}
                onPress={() => selectRecommendation(recommendation?.recommendation3)}></AppButton>
            <FlatList data={modelRecommendations || []}
                keyExtractor={(item) => item.InternalName}
                style={{ marginTop: 10 }}
                renderItem={({ item }) => <View style={{ marginBottom: 5 }}>
                    <Text style={style.paragraph}>Name: {item.DisplayName}</Text>
                    <Text style={style.paragraph}>Score: {Math.round((item.Score || 0) * 100)}</Text>
                </View>}></FlatList>
        </View >
    );
}

const style = StyleSheet.create({
    title: {
        fontSize: 20,
        lineHeight: 26,
        fontFamily: 'Rubik-Bold',
        color: BaseColors.deepblue,
        marginBottom: 18,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 26,
        fontFamily: 'Rubik',
        color: BaseColors.deepblue,
    },
    button: {
        marginBottom: 10
    }
})