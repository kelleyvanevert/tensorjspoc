import React, { useEffect, useState } from 'react';
// @ts-ignore
// import brain from 'brain.js/browser';

import { View } from 'react-native';
import { ITrainingData, IExcercise, YesNo, Exercises, Mood, Moods } from '../interfaces';
import { MoodComponent } from './mood-selector';
import { ExerciseScores } from './exercise-scores';
import { RecommendedExercises } from './recommended-exercises';
import { LogisticRoomOracle } from './oracle.js';

export function RoomOracle() {
    const [exercises] = useState<IExcercise[]>(Exercises)
    const [trainingData, setTrainingData] = useState<ITrainingData[]>([]);
    const [oracle] = useState<LogisticRoomOracle>(new LogisticRoomOracle(
    [
        'mood_value',
        'three_five_mins',
        'five_seven_mins',
        'seven_ten_mins',
        'deffuse',
        'zoom_out',
        'feeling_stressed',
        'feeling_angry',
        'mood_boost',
        'self_compassion'
    ], 0.25));
    const [mood, setMood] = useState<Mood>(Moods[0]);
    const [modelRecommendations, setModelRecommendations] = useState<IExcercise[]>()

    useEffect(() => {        
        compute_recommendation();
        setTrainingData([])
    }, []);

    const compute_recommendation = () => {
        const computedReccommendation: IExcercise[] = []
        let SoftmaxBeta = 2;
        let SoftmaxDenominator = 0;
        for (let index = 0; index < exercises.length; index++) {
            const exercise = exercises[index];
            exercise.Value.mood_value = mood?.value || -1; //TODO: -1 is an issue here - we want to handle undefined 'mood.value'
            exercise.Score = oracle.predict(exercise.Value);
            exercise.SoftmaxNumerator = Math.exp(SoftmaxBeta * exercise.Score || 0);
            SoftmaxDenominator += exercise.SoftmaxNumerator;
            computedReccommendation.push(exercise)
        }
        for (let index = 0; index < computedReccommendation.length; index++) {
            const exercise = computedReccommendation[index];
            exercise.Probability = (exercise.SoftmaxNumerator || 0) / SoftmaxDenominator;
        }
        const sortedRecommendation: IExcercise[] = computedReccommendation.sort((a, b) => (b.Score || 0) - (a.Score || 0));
        setModelRecommendations(sortedRecommendation);
    }

    const selectRecommendation = (newTrainingData: ITrainingData[]) => {
        setTrainingData([...trainingData, ...newTrainingData]); // save training data for historical purposes. TODO: May be remove if not needed
        oracle.fit(newTrainingData[0].input, newTrainingData[0].output.score); // re-training only on new training data
        console.log("oracle theta", oracle.getThetaHash());
        compute_recommendation();
    }

    const setCurrentMood = (mood: Mood) => setMood(mood)

    return (
        <View>
            <MoodComponent initialMood={mood} callback={setCurrentMood} />
            {
                (() => {
                    if (modelRecommendations != undefined) {
                        return <RecommendedExercises
                            exercises={modelRecommendations}
                            callback={selectRecommendation}
                        />
                    }
                })()
            }
            <ExerciseScores recommendations={modelRecommendations || []} />
        </View >
    );
}