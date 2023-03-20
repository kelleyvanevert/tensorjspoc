import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { ITrainingData, IExcercise, YesNo, Exercises, Mood, Moods, IContext, generateContext} from '../interfaces';
import { ContextComponent } from './ContextComponent';
import { ExerciseScores } from './ExerciseScores';
import { RecommendedExercises } from './RecommendedExercises';
import { LogisticOracle} from '../services/LogisticOracle';
import { calculateScoresAndSortExercises } from '../services/Bandit';


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
        // for each new training data, re-train the model:
        for (let index = 0; index < newTrainingData.length; index++) {
            const trainingData = newTrainingData[index];
            oracle.fit(trainingData, learningRate, undefined, undefined);
        }
        // console.log("oracle theta", oracle.getThetaMap());
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
    
