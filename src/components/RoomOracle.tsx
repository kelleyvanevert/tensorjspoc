import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { ITrainingData, IExcercise, YesNo, Exercises, Mood, Moods, IContext, generateContext} from '../interfaces';
import { ContextComponent } from './ContextComponent';
import { ExerciseScores } from './ExerciseScores';
import { RecommendedExercises } from './RecommendedExercises';
import { LogisticOracle} from '../services/LogisticOracle';


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
            false, //addIntercept
            true, //useInversePropensityWeighting
        )
    );
    // const [mood, setMood] = useState<Mood>(Moods[0]);
    const [context, setContext] = useState<IContext>(generateContext(Moods[0]));
    const [modelRecommendations, setModelRecommendations] = useState<IExcercise[]>()

    useEffect(() => {        
        recomputeRecommendations(context);
        setTrainingData([])
    }, []);

    const recomputeRecommendations = (newContext: IContext) => {
        setContext(newContext);
        const updatedContext = { ...context, ...newContext };
        const computedRecommendation: IExcercise[] = []
        //let SoftmaxBeta = 2;
        let SoftmaxNumerators = []
        for (let index = 0; index < exercises.length; index++) {
            const exercise = exercises[index];
            // console.log("RoomOracle predict", context, exercise.Features);
            exercise.Score = oracle.predict(updatedContext, exercise.Features);
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

        const scores = exercises.map(exercise => exercise.Score);
        const probabilities = exercises.map(exercise => exercise.Probability);
        console.log("recomputeRecommendations", updatedContext, scores, probabilities, oracle.getThetaMap());
        // const X = oracle.getOrderedInputsArray(
        //     updatedContext, 
        //     exercises[0].Features,
        //   )
        // console.log("recomputeRecommendations X", exercises[0].Features, X);

        // console.log("compute_recommendation softmax ", SoftmaxNumerators, SoftmaxDenominator);
        const sortedRecommendation: IExcercise[] = computedRecommendation.sort((a, b) => (b.Score || 0) - (a.Score || 0));
        console.log("compute_recommendation computedReccommendation", sortedRecommendation);
        setModelRecommendations(sortedRecommendation);
        
    }

    const fitOracleOnTrainingData = (newTrainingData: ITrainingData[]) => {
        setTrainingData([...trainingData, ...newTrainingData]); // save training data for historical purposes. TODO: May be remove if not needed
        // for each new training data, re-train the model:
        for (let index = 0; index < newTrainingData.length; index++) {
            const trainingData = newTrainingData[index];
            oracle.fit(trainingData, learningRate, undefined, undefined);
        }
        // console.log("oracle theta", oracle.getThetaMap());
        recomputeRecommendations(context);
    }

    const onLearningRateChange = (value: number) => {
        setLearningRate(value);
        oracle.setlearningRate(value);
    }

    const onSoftmaxBetaChange = (value: number) => {
        setSoftmaxBeta(value);
        recomputeRecommendations(context);
    }

    return (
        <View>

            <ContextComponent callback={recomputeRecommendations} />
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
    
