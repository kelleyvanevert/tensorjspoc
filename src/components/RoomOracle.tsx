import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Slider from '@react-native-community/slider';
import { BaseColors } from "./colors";

import { 
    ITrainingData, 
    IExcercise, 
    Exercises,
    exerciseNames, 
    Moods, 
    IContext, 
    generateContext
} from '../interfaces';
import { ContextComponent } from './ContextComponent';
import { ExerciseScores } from './ExerciseScores';
import { RecommendedExercises } from './RecommendedExercises';
import { LogisticOracle} from '../services/LogisticOracle';
import { calculateScoresAndSortExercises } from '../services/Bandit';


// TODO:
// - After selecting an exercise, show popup with start rating feedback - DONE
// - Have a seperate rating oracle that is trained on the start rating feedback
// - add a tab or popup with all exercises details
// - add a tab or popup with oracle details:
//      - features used - DONE
//      - current weights - DONE
// - add exerciseCounts to exercises - DONE
// - add all the exercises and all the features
// - allow user to select features to be used by the model - DONE
// - add onehotencoded features for the exercise - DONE


export function RoomOracle() {
    const [exercises, setExercises] = useState<IExcercise[]>(Exercises)
    const [trainingData, setTrainingData] = useState<ITrainingData[]>([]);
    const [learningRate, setLearningRate] = useState<number>(0.05);
    const [softmaxBeta, setSoftmaxBeta] = useState<number>(2);
    const [contextFeatures, setContextFeatures] = useState<string[]>(
        ['happy', 'sad', ]);
    const [exerciseFeatures, setExerciseFeatures] = useState<string[]>(
        [ 
            'three_five_mins',
            'five_seven_mins',
            'seven_ten_mins',
            'deffuse',
            'zoom_out',
            'feeling_stressed',
            'feeling_angry',
            'mood_boost',
            'self_compassion'
        ]);
    const [clickOracle, setClickOracle] = useState<LogisticOracle>(new LogisticOracle(
            contextFeatures, //contextFeatures
            exerciseFeatures, //exerciseFeatures
            exerciseNames, //exerciseNames
            0.05, //learningRate
            1, //iterations
            true, //addIntercept
            false, //useInversePropensityWeighting
            true, //useInversePropensityWeightingPositiveOnly
            'clicked' // targetLabel
        )
    );
    const [ratingOracle, setRatingOracle] = useState<LogisticOracle>(new LogisticOracle(
        contextFeatures, //contextFeatures
        exerciseFeatures, //exerciseFeatures
        exerciseNames, //exerciseNames
        0.05, //learningRate
        1, //iterations
        true, //addIntercept
        true, //useInversePropensityWeighting
        false, //useInversePropensityWeightingPositiveOnly
        'stars', // targetLabel
    )
);
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
            clickOracle, ratingOracle, updatedContext, exercises, softmaxBeta
        )
        setModelRecommendations(sortedExercises);
    }

    const updateExerciseCount = (newTrainingData: ITrainingData[]) => {
        console.log(newTrainingData)
        newTrainingData.forEach((trainingData) => {
            if (trainingData.clicked == 1) {
                console.log("Exercise Name", trainingData.input.exerciseName)
                const exercise = exercises.find((exercise) => exercise.InternalName === trainingData.input.exerciseName);
                if (exercise) {
                    if (exercise.SelectedCount === undefined) {
                        exercise.SelectedCount = 1;
                    } else {
                        exercise.SelectedCount += 1;
                    }
                }
            }
        });
    }
    
    const fitOracleOnTrainingData = (newTrainingData: ITrainingData[]) => {
        setTrainingData([...trainingData, ...newTrainingData]); // save training data for historical purposes. TODO: May be remove if not needed
        clickOracle.fitMultiple(newTrainingData, learningRate, undefined, undefined);
        ratingOracle.fitMultiple(newTrainingData, learningRate, undefined, undefined);
        console.log("ratingOracle theta", ratingOracle.getThetaMap())
        recalculateRecommendations(context);
        updateExerciseCount(newTrainingData);        
    }

    const onLearningRateChange = (value: number) => {
        setLearningRate(value);
        clickOracle.setlearningRate(value);
    }

    const onSoftmaxBetaChange = (value: number) => {
        setSoftmaxBeta(value);
        recalculateRecommendations(context);
    }

    const onSelectedContextItemsChange = (value: string[]) => {
        console.log(value)
        setContextFeatures(value);
        clickOracle.updateFeatures(value, clickOracle.exerciseFeatures);
        recalculateRecommendations(context);
    }

    const onSelectedExerciseItemsChange = (value: string[]) => {
        console.log(value)
        setExerciseFeatures(value);
        clickOracle.updateFeatures(clickOracle.contextFeatures, value);
        recalculateRecommendations(context);
    }
    
    const contextItems = [
        {
          name: 'Context Features',
          id: 'contextFeatures',
          children: Object.keys(context).map((key) => {
            return { name: key, id: key }
        }),
        }
    ];

    const exerciseItems = [
        {
            name: 'Exercise Features',
            id: 'exerciseFeatures',
            // these are the children or 'sub items'
            children: Object.keys(Exercises[0].Features).map((key) => {
                return { name: key, id: key }
            }),
        }       
      ];

    return (
        <View>
            <Text style={style.title}>Do EMA</Text>
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

            <Text style={style.title}>Exercise Scores</Text>
            <ExerciseScores recommendations={modelRecommendations || []} />

            <Text style={style.title}>Configure Algorithm</Text>
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
            <Text style={{marginRight: 10}}>Exploration:</Text>
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



            <SectionedMultiSelect
                items={contextItems}
                IconRenderer={Icon}
                uniqueKey="name"
                subKey="children"
                selectText="Select context features..."
                single={false}
                showDropDowns={false}
                readOnlyHeadings={true}
                onSelectedItemsChange={onSelectedContextItemsChange}
                selectedItems={contextFeatures}
            />
            <SectionedMultiSelect
                items={exerciseItems}
                IconRenderer={Icon}
                uniqueKey="name"
                subKey="children"
                selectText="Select exercise features..."
                single={false}
                showDropDowns={false}
                readOnlyHeadings={true}
                onSelectedItemsChange={onSelectedExerciseItemsChange}
                selectedItems={exerciseFeatures}
            />

            <Text style={style.title}>Algorithm JSON payload</Text>
            <Text>{clickOracle.toJSON()}</Text>

        </View >
    );
};

const style = StyleSheet.create({
    title: {
        fontSize: 20,
        lineHeight: 26,
        fontFamily: 'Rubik-Bold',
        color: BaseColors.deepblue,
        marginBottom: 18,
        marginTop:10,
    },
    button: {
        marginBottom: 10
    }
})
    
