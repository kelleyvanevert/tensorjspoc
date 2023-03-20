import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { ITrainingData, IExcercise, YesNo, Exercises, Mood, Moods, IContext, generateContext} from '../interfaces';
import { ContextComponent } from './ContextComponent';
import { ExerciseScores } from './ExerciseScores';
import { RecommendedExercises } from './RecommendedExercises';
import { LogisticOracle} from '../services/LogisticOracle';
import { calculateScoresAndSortExercises } from '../services/Bandit';


// TODO:
// - After selecting an exercise, show popup with start rating feedback
// - Have a seperate rating oracle that is trained on the start rating feedback
// - add a tab or popup with all exercises details
// - add a tab or popup with oracle details:
//      - features used
//      - current weights
// - add all the exercises and all the features
// - allow user to select features to be used by the model

export function RoomOracle() {
    const [exercises] = useState<IExcercise[]>(Exercises)
    const [trainingData, setTrainingData] = useState<ITrainingData[]>([]);
    const [learningRate, setLearningRate] = useState<number>(0.05);
    const [softmaxBeta, setSoftmaxBeta] = useState<number>(2);
    const [oracle, setOracle] = useState<LogisticOracle>(new LogisticOracle(
            [ //contextFeatures
                'happy',
                'sad', 
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
    const [context, setContext] = useState<IContext>(generateContext(Moods[0]));
    const [modelRecommendations, setModelRecommendations] = useState<IExcercise[]>()

    useEffect(() => {        
        recalculateRecommendations(context);
        setTrainingData([])
    }, []);

    const recalculateRecommendations = (newContext: IContext) => {
        setContext(newContext);
        const updatedContext = { ...context, ...newContext };
        const sortedExercises = calculateScoresAndSortExercises(
            oracle, updatedContext, exercises, softmaxBeta
        )
        setModelRecommendations(sortedExercises);
    }

    const fitOracleOnTrainingData = (newTrainingData: ITrainingData[]) => {
        setTrainingData([...trainingData, ...newTrainingData]); // save training data for historical purposes. TODO: May be remove if not needed
        oracle.fit_multiple(newTrainingData, learningRate, undefined, undefined);
        recalculateRecommendations(context);
    }

    const onLearningRateChange = (value: number) => {
        setLearningRate(value);
        oracle.setlearningRate(value);
    }

    const onSoftmaxBetaChange = (value: number) => {
        setSoftmaxBeta(value);
        recalculateRecommendations(context);
    }

    return (
        <View>

            <ContextComponent callback={recalculateRecommendations} />
            {
                (() => {
                    if (modelRecommendations != undefined) {
                        return <RecommendedExercises
                            context={context}
                            exercises={modelRecommendations}
                            softmaxBeta={softmaxBeta}
                            callback={fitOracleOnTrainingData}
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
};
    
