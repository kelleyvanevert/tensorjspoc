import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
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
// - Have a seperate rating oracle that is trained on the start rating feedback - DONE
// - average out the click and rating score for each exercise - DONE
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
    const [clickLearningRate, setClickLearningRate] = useState<number>(0.01);
    const [ratingLearningRate, setRatingLearningRate] = useState<number>(2.0);
    const [ClickContextFeatures, setClickContextFeatures] = useState<string[]>(
        ['happy', 'sad', ]);
    const [ClickExerciseFeatures, setClickExerciseFeatures] = useState<string[]>(
        [ 
            'three_five_mins',
            'five_seven_mins',
            'seven_ten_mins',
            'diffuse',
            'zoom_out',
            'feeling_stressed',
            'feeling_angry',
            'mood_boost',
            'self_compassion'
        ]);
    const [RatingContextFeatures, setRatingContextFeatures] = useState<string[]>([]);
    const [RatingExerciseFeatures, setRatingExerciseFeatures] = useState<string[]>([]);
    const [clickOracle, setClickOracle] = useState<LogisticOracle>(new LogisticOracle(
            ClickContextFeatures, //contextFeatures
            ClickExerciseFeatures, //exerciseFeatures
            exerciseNames, //exerciseNames
            clickLearningRate, //learningRate
            1, //iterations
            true, //addIntercept
            true, //useInversePropensityWeighting
            false, //useInversePropensityWeightingPositiveOnly
            'clicked' // targetLabel
        )
    );
    const [ratingOracle, setRatingOracle] = useState<LogisticOracle>(new LogisticOracle(
        RatingContextFeatures, //contextFeatures
        RatingExerciseFeatures, //exerciseFeatures
        exerciseNames, //exerciseNames
        ratingLearningRate, //learningRate
        1, //iterations
        true, //addIntercept
        false, //useInversePropensityWeighting
        false, //useInversePropensityWeightingPositiveOnly
        'stars', // targetLabel
        )
    );
    const [softmaxBeta, setSoftmaxBeta] = useState<number>(2);
    const [ratingWeight, setRatingWeight] = useState<number>(0.5);
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
            clickOracle, ratingOracle, updatedContext, exercises, softmaxBeta, ratingWeight
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
        clickOracle.fitMultiple(newTrainingData, clickLearningRate, undefined, undefined);
        ratingOracle.fitMultiple(newTrainingData, ratingLearningRate, undefined, undefined);
        console.log("ratingOracle theta", ratingOracle.getThetaMap())
        recalculateRecommendations(context);
        updateExerciseCount(newTrainingData);        
    }

    const onClickLearningRateChange = (value: number) => {
        setClickLearningRate(value);
        clickOracle.setlearningRate(value);
    }

    const onRatingLearningRateChange = (value: number) => {
        setRatingLearningRate(value);
        ratingOracle.setlearningRate(value);
    }

    const onSelectedClickContextItemsChange = (value: string[]) => {
        console.log(value)
        setClickContextFeatures(value);
        clickOracle.updateFeatures(value, clickOracle.exerciseFeatures);
        recalculateRecommendations(context);
    }

    const onSelectedRatingContextItemsChange = (value: string[]) => {
        console.log(value)
        setRatingContextFeatures(value);
        ratingOracle.updateFeatures(value, ratingOracle.exerciseFeatures);
        recalculateRecommendations(context);
    }

    const onSelectedClickExerciseItemsChange = (value: string[]) => {
        console.log(value)
        setClickExerciseFeatures(value);
        clickOracle.updateFeatures(clickOracle.contextFeatures, value);
        recalculateRecommendations(context);
    }

    const onSelectedRatingExerciseItemsChange = (value: string[]) => {
        console.log(value)
        setRatingExerciseFeatures(value);
        ratingOracle.updateFeatures(ratingOracle.contextFeatures, value);
        recalculateRecommendations(context);
    }

    const onSoftmaxBetaChange = (value: number) => {
        setSoftmaxBeta(value);
        recalculateRecommendations(context);
    }

    const onRatingWeightChange = (value: number) => {
        setRatingWeight(value);
        recalculateRecommendations(context);
    }

    const renderExercise = ({ item }: { item: IExcercise }) => (
        <View style={style.exercise}>
          <Text style={style.exerciseName}>{item.DisplayName}</Text>
          <Text>{JSON.stringify(item.Features)}</Text>
        </View>
      );
    
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
            <Text style={style.subtitle}>ClickOracle</Text>
            {/* Slider for learningRate */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{marginRight: 10}}>Learning Rate:</Text>
            <Slider
                style={{width: 200}}
                minimumValue={0.01}
                maximumValue={0.5}
                step={0.01}
                value={clickLearningRate}
                onSlidingComplete={onClickLearningRateChange}
            />
            <Text style={{marginLeft: 10}}>{clickLearningRate.toFixed(2)}</Text>
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
                onSelectedItemsChange={onSelectedClickContextItemsChange}
                selectedItems={ClickContextFeatures}
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
                onSelectedItemsChange={onSelectedClickExerciseItemsChange}
                selectedItems={ClickExerciseFeatures}
            />

            <Text style={style.subtitle}>RatingOracle</Text>

            {/* Slider for learningRate */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{marginRight: 10}}>Learning Rate:</Text>
            <Slider
                style={{width: 200}}
                minimumValue={0.01}
                maximumValue={10.0}
                step={0.01}
                value={ratingLearningRate}
                onSlidingComplete={onRatingLearningRateChange}
            />
            <Text style={{marginLeft: 10}}>{ratingLearningRate.toFixed(2)}</Text>
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
                onSelectedItemsChange={onSelectedRatingContextItemsChange}
                selectedItems={RatingContextFeatures}
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
                onSelectedItemsChange={onSelectedRatingExerciseItemsChange}
                selectedItems={RatingExerciseFeatures}
            />
            <Text style={style.subtitle}>Recommender</Text>

            {/* Slider for softmaxBeta */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{marginRight: 10}}>Exploration:</Text>
            <Slider
                style={{width: 200}}
                minimumValue={0.5}
                maximumValue={10}
                step={0.5}
                value={softmaxBeta}
                onSlidingComplete={onSoftmaxBetaChange}
            />
            <Text style={{marginLeft: 10}}>{softmaxBeta.toFixed(1)}</Text>
            </View>

            {/* Slider for ratingWeight */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{marginRight: 10}}>Rating weight:</Text>
            <Slider
                style={{width: 200}}
                minimumValue={0.0}
                maximumValue={1.0}
                step={0.01}
                value={ratingWeight}
                onValueChange={setRatingWeight}
                //only update on release:
                onSlidingComplete={onRatingWeightChange}
            />
            <Text style={{marginLeft: 10}}>{ratingWeight.toFixed(2)}</Text>
            </View>

            <Text style={style.title}>Algorithm JSON payload</Text>
            <Text style={style.subtitle}>CLickOracle</Text>

            <Text>{clickOracle.toJSON()}</Text>

            <Text style={style.subtitle}>RatingOracle</Text>

            <Text>{ratingOracle.toJSON()}</Text>

            <Text style={style.title}>Exercises details</Text>

            <FlatList
                data={Exercises}
                renderItem={renderExercise}
                keyExtractor={(item) => item.InternalName}
            />

            {/* <Text>{JSON.stringify(Exercises, null, 2)}</Text> */}


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
    subtitle: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'Rubik-Bold',
        color: BaseColors.darkgrey,
        marginBottom: 10,
        marginTop:8,
    },
    button: {
        marginBottom: 10
    },
    exercise: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
      },
})
    
