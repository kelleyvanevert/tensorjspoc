import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { ITrainingData, IExcercise, YesNo, Exercises, Mood, Moods, IContext } from '../interfaces';
import { ContextComponent } from './ContextComponent';
import { ExerciseScores } from './ExerciseScores';
import { RecommendedExercises } from './RecommendedExercises';
import { LogisticOracle } from './LogisticOracle.js';


export function RoomOracle() {
    const [exercises] = useState<IExcercise[]>(Exercises)
    const [trainingData, setTrainingData] = useState<ITrainingData[]>([]);
    const [learningRate, setLearningRate] = useState<number>(0.05);
    const [softmaxBeta, setSoftmaxBeta] = useState<number>(2);
    const [oracle] = useState<LogisticOracle>(new LogisticOracle(
            [ //contextFeatures
                'mood', 
            ], 
            [ //activityFeatures
                'three_five_mins',
                'five_seven_mins',
                'seven_ten_mins',
                'deffuse',
                'zoom_out',
                'feeling_stressed',
                'feeling_angry',
                'mood_boost',
                'self_compassion'
            ], 
            0.05, //learningRate
            1, //iterations
            true, //addIntercept
            true, //useInversePropensityWeighting
        )
    );
    // const [mood, setMood] = useState<Mood>(Moods[0]);
    const [context, setContext] = useState<IContext>({mood: Moods[0].value});
    const [modelRecommendations, setModelRecommendations] = useState<IExcercise[]>()

    useEffect(() => {        
        compute_recommendation();
        setTrainingData([])
    }, []);

    const compute_recommendation = () => {
        const computedRecommendation: IExcercise[] = []
        //let SoftmaxBeta = 2;
        let SoftmaxNumerators = []
        for (let index = 0; index < exercises.length; index++) {
            const exercise = exercises[index];
            // console.log("RoomOracle predict", context, exercise.Features);
            exercise.Score = oracle.predict(context, exercise.Features);
            exercise.PenalizedScore = exercise.Score;
            SoftmaxNumerators.push(Math.exp(softmaxBeta * exercise.Score || 0));
            computedRecommendation.push(exercise)
        }
        // SoftmaxDenominator equals the sum of softmax numerators:
        let SoftmaxDenominator = SoftmaxNumerators.reduce((a, b) => a + b, 0);
        for (let index = 0; index < computedRecommendation.length; index++) {
            const exercise = computedRecommendation[index];
            exercise.Probability = SoftmaxNumerators[index] / SoftmaxDenominator;
        }
        // console.log("compute_recommendation softmax ", SoftmaxNumerators, SoftmaxDenominator);
        const sortedRecommendation: IExcercise[] = computedRecommendation.sort((a, b) => (b.Score || 0) - (a.Score || 0));
        setModelRecommendations(sortedRecommendation);
        // console.log("compute_recommendation computedReccommendation", sortedRecommendation);
    }

    const selectRecommendation = (newTrainingData: ITrainingData[]) => {
        setTrainingData([...trainingData, ...newTrainingData]); // save training data for historical purposes. TODO: May be remove if not needed
        // for each new training data, re-train the model:
        for (let index = 0; index < newTrainingData.length; index++) {
            const trainingData = newTrainingData[index];
            if (trainingData.output.score == 1){
                oracle.fit(trainingData, learningRate, 1, true);
            }
            else {
                oracle.fit(trainingData, learningRate, 1, false);
            }
            
        }
        console.log("oracle theta", oracle.getThetaMap());
        compute_recommendation();
    }

    const onLearningRateChange = (value: number) => {
        setLearningRate(value);
        oracle.setlearningRate(value);
    }

    const onSoftmaxBetaChange = (value: number) => {
        setSoftmaxBeta(value);
        compute_recommendation();
    }

    const onContextChange = (context: IContext) => {
        setContext(context);
        compute_recommendation();
    }

    return (
        <View>

            <ContextComponent initialContext={context} callback={onContextChange} />
            {
                (() => {
                    if (modelRecommendations != undefined) {
                        return <RecommendedExercises
                            context={context}
                            exercises={modelRecommendations}
                            callback={selectRecommendation}
                        />
                    }
                })()
            }

            {/* Slider for learningRate */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{marginRight: 10}}>Learning Rate:</Text>
            <Slider
                style={{width: 200}}
                minimumValue={0.01}
                maximumValue={0.5}
                step={0.01}
                value={learningRate}
                onValueChange={onLearningRateChange}
            />
            <Text style={{marginLeft: 10}}>{learningRate.toFixed(2)}</Text>
            </View>

            {/* Slider for softmaxBeta */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{marginRight: 10}}>Softmax Beta:</Text>
            <Slider
                style={{width: 200}}
                minimumValue={0.5}
                maximumValue={10}
                step={0.5}
                value={softmaxBeta}
                onValueChange={onSoftmaxBetaChange}
            />
            <Text style={{marginLeft: 10}}>{softmaxBeta.toFixed(1)}</Text>
            </View>

            <ExerciseScores recommendations={modelRecommendations || []} />
        </View >
    );
}