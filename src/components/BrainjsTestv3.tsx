import React, { useEffect, useState } from 'react';
// @ts-ignore
import brain from 'brain.js/browser';
import { View } from 'react-native';
import { TrainingData, IExcercise, YesNo, Exercises, Mood, Moods } from '../interfaces';
import { MoodComponent } from './mood-selector';
import { ModelScores } from './ModelScore';
import { RecommendedExercises } from './recommended-exercises';

export function BrainJsTestv3() {
    const [exercises] = useState<IExcercise[]>(Exercises)
    const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
    const [net] = useState<brain.NeuralNetwork>(new brain.NeuralNetwork({
        activation: 'sigmoid',
        hiddenLayers: [4]
    }));
    const [mood, setMood] = useState<Mood>(Moods[0]);
    const [modelRecommendations, setModelRecommendations] = useState<IExcercise[]>()

    useEffect(() => {
        const trainingData: TrainingData = {
            input: {
                mood_value: Moods[0].value, //SOSO
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
        setTrainingData([trainingData])
    }, []);

    const compute_recommendation = () => {
        const computedReccommendation: IExcercise[] = []
        for (let index = 0; index < exercises.length; index++) {
            const exercise = exercises[index];
            exercise.Value.mood_value = mood?.value || -1; //TODO: -1 is an issue here - we want to handle undefined 'mood.value'
            exercise.Score = net.run(exercise.Value).score
            computedReccommendation.push(exercise)
        }

        const sortedRecommendation: IExcercise[] = computedReccommendation.sort((a, b) => (b.Score || 0) - (a.Score || 0));
        setModelRecommendations(sortedRecommendation);
    }

    const selectRecommendation = (newTrainingData: TrainingData[]) => {
        setTrainingData([...trainingData, ...newTrainingData]); // save training data for historical purposes. TODO: May be remove if not needed
        // console.log(newTrainingData.map(s => s.output.score));
        net.train(newTrainingData); // re-training only on new training data
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
            <ModelScores recommendations={modelRecommendations || []} />
        </View >
    );
}