import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View, Text, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Slider from '@react-native-community/slider';
import { BaseColors } from "./colors";

// TODO:
// [x] add toggles for interactions
// [ ] add toggles for inverse propensity weighting
// [ ] add rule based recommendation option

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
import { LogisticOracle, LogisticOracleFromJSON} from '../services/LogisticOracle';
import { calculateScoresAndSortExercises } from '../services/Bandit';


export function RoomOracle() {
    const [exercises, setExercises] = useState<IExcercise[]>(Exercises)
    const [trainingData, setTrainingData] = useState<ITrainingData[]>([]);
    const [clickLearningRate, setClickLearningRate] = useState<number>(0.01);
    const [clickAddIntercept, setClickAddIntercept] = useState<boolean>(true);
    const [clickContextExerciseInteractions, setClickContextExerciseInteractions] = useState<boolean>(true);
    const [clickContextExerciseFeatureInteractions, setClickContextExerciseFeatureInteractions] = useState<boolean>(true);
    
    const [ClickContextFeatures, setClickContextFeatures] = useState<string[]>(
        ['happy', 'sad', ]);
    const [ClickExerciseFeatures, setClickExerciseFeatures] = useState<string[]>(
        [ 
            'three_five_mins',
            'five_seven_mins',
            'seven_ten_mins',
            'defuse',
            'zoom_out',
            'feeling_stressed',
            'feeling_angry',
            'mood_boost',
            'self_compassion',
            'relax',
            'energize',
            'feeling_anxious',
            'grounding',
            'feeling_blue',
            'focus',
            'shift_perspective',
            'introspect',
            'breathing',
            'article',
        ]);
    const [clickOracle, setClickOracle] = useState<LogisticOracle>(new LogisticOracle(
            ClickContextFeatures, //contextFeatures
            ClickExerciseFeatures, //exerciseFeatures
            exerciseNames, //exerciseNames
            clickLearningRate, //learningRate
            1, //iterations
            clickAddIntercept, //addIntercept
            clickContextExerciseInteractions, // contextExerciseInteractions
            clickContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
            true, //useInversePropensityWeighting
            false, //useInversePropensityWeightingPositiveOnly
            'clicked' // targetLabel
        )
    );
    
    const [ratingLearningRate, setRatingLearningRate] = useState<number>(2.0);
    const [ratingAddIntercept, setRatingAddIntercept] = useState<boolean>(true);
    const [ratingContextExerciseInteractions, setRatingContextExerciseInteractions] = useState<boolean>(true);
    const [ratingContextExerciseFeatureInteractions, setRatingContextExerciseFeatureInteractions] = useState<boolean>(false);
    const [RatingContextFeatures, setRatingContextFeatures] = useState<string[]>([]);
    const [RatingExerciseFeatures, setRatingExerciseFeatures] = useState<string[]>([]);
    
    const [ratingOracle, setRatingOracle] = useState<LogisticOracle>(new LogisticOracle(
        RatingContextFeatures, //contextFeatures
        RatingExerciseFeatures, //exerciseFeatures
        exerciseNames, //exerciseNames
        ratingLearningRate, //learningRate
        1, //iterations
        ratingAddIntercept, //addIntercept
        ratingContextExerciseInteractions, // contextExerciseInteractions
        ratingContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
        false, //useInversePropensityWeighting
        false, //useInversePropensityWeightingPositiveOnly
        'rating', // targetLabel
        )
    );
    const [softmaxBeta, setSoftmaxBeta] = useState<number>(2);
    const [ratingWeight, setRatingWeight] = useState<number>(0.2);
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
        clickOracle.fitMany(newTrainingData, clickLearningRate, undefined, undefined);
        ratingOracle.fitMany(newTrainingData, ratingLearningRate, undefined, undefined);
        console.log("ratingOracle weights", ratingOracle.getWeightsMap())
        recalculateRecommendations(context);
        updateExerciseCount(newTrainingData);        
    }

    const onClickLearningRateChange = (value: number) => {
        setClickLearningRate(value);
        clickOracle.learningRate = value;
    }

    const onSelectedClickContextItemsChange = (newContextFeatures: string[]) => {
        setClickContextFeatures(newContextFeatures);
        clickOracle.setFeaturesAndUpdateWeights(
            newContextFeatures, 
            clickOracle.exerciseFeatures,
            clickOracle.exerciseNames,
            clickOracle.addIntercept,
            clickOracle.contextExerciseInteractions,
            clickOracle.contextExerciseFeatureInteractions,
            clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onSelectedClickExerciseItemsChange = (newExerciseFeatures: string[]) => {
        setClickExerciseFeatures(newExerciseFeatures);
        clickOracle.setFeaturesAndUpdateWeights(
            clickOracle.contextFeatures, 
            newExerciseFeatures,
            clickOracle.exerciseNames,
            clickOracle.addIntercept,
            clickOracle.contextExerciseInteractions,
            clickOracle.contextExerciseFeatureInteractions,
            clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onClickExerciseInteractionsChange = (contextExerciseInteractions: boolean) => {
        setClickContextExerciseInteractions(contextExerciseInteractions);
        clickOracle.setFeaturesAndUpdateWeights(
            clickOracle.contextFeatures, 
            clickOracle.exerciseFeatures,
            clickOracle.exerciseNames,
            clickOracle.addIntercept,
            contextExerciseInteractions,
            clickOracle.contextExerciseFeatureInteractions,
            clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onClickExerciseFeaturesInteractionsChange = (contextExerciseFeatureInteractions: boolean) => {
        setClickContextExerciseFeatureInteractions(contextExerciseFeatureInteractions);
        clickOracle.setFeaturesAndUpdateWeights(
            clickOracle.contextFeatures, 
            clickOracle.exerciseFeatures,
            clickOracle.exerciseNames,
            clickOracle.addIntercept,
            clickOracle.contextExerciseInteractions,
            contextExerciseFeatureInteractions,
            clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onRatingLearningRateChange = (value: number) => {
        setRatingLearningRate(value);
        ratingOracle.learningRate = value;
    }

    const onSelectedRatingContextItemsChange = (newContextFeatures: string[]) => {
        setRatingContextFeatures(newContextFeatures);
        ratingOracle.setFeaturesAndUpdateWeights(
            newContextFeatures, 
            ratingOracle.exerciseFeatures,
            ratingOracle.exerciseNames,
            ratingOracle.addIntercept,
            ratingOracle.contextExerciseInteractions,
            ratingOracle.contextExerciseFeatureInteractions,
            ratingOracle.getWeightsHash(),
        );
        recalculateRecommendations(context);
    }

    const onSelectedRatingExerciseItemsChange = (newExerciseFeatures: string[]) => {
        setRatingExerciseFeatures(newExerciseFeatures);
        ratingOracle.setFeaturesAndUpdateWeights(
            ratingOracle.contextFeatures, 
            newExerciseFeatures,
            ratingOracle.exerciseNames,
            ratingOracle.addIntercept,
            ratingOracle.contextExerciseInteractions,
            ratingOracle.contextExerciseFeatureInteractions,
            ratingOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onRatingExerciseInteractionsChange = (contextExerciseInteractions: boolean) => {
        setRatingContextExerciseInteractions(contextExerciseInteractions);
        ratingOracle.setFeaturesAndUpdateWeights(
            ratingOracle.contextFeatures, 
            ratingOracle.exerciseFeatures,
            ratingOracle.exerciseNames,
            ratingOracle.addIntercept,
            contextExerciseInteractions,
            ratingOracle.contextExerciseFeatureInteractions,
            ratingOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onRatingExerciseFeaturesInteractionsChange = (contextExerciseFeatureInteractions: boolean) => {
        setRatingContextExerciseFeatureInteractions(contextExerciseFeatureInteractions);
        ratingOracle.setFeaturesAndUpdateWeights(
            ratingOracle.contextFeatures, 
            ratingOracle.exerciseFeatures,
            ratingOracle.exerciseNames,
            ratingOracle.addIntercept,
            ratingOracle.contextExerciseInteractions,
            contextExerciseFeatureInteractions,
            ratingOracle.getWeightsHash(),
            );
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
          <View style={style.exerciseFeatures}>
            <View style={style.exerciseFeatureRow}>
              {Object.entries(item.Features).map(([key, value]) => (
                // Only render feature if value is equal to 1
                value === 1 && (
                  <View style={style.exerciseFeature} key={key}>
                    <Text style={style.exerciseFeatureName}>{key}:</Text>
                    <Text style={style.exerciseFeatureValue}>{value}</Text>
                  </View>
                )
              ))}
            </View>
          </View>
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

            <Text style={style.title}>All exercises ranked by probability:</Text>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{marginRight: 10}}>Context-Exercise Interactions:</Text>
                    <Switch
                        onValueChange={onClickExerciseInteractionsChange}
                        value={clickContextExerciseInteractions}
                    />
                </View>
                <View>
                    <Text style={{marginRight: 10}}>Context-Feature Interactions:</Text>
                    <Switch
                        onValueChange={onClickExerciseFeaturesInteractionsChange}
                        value={clickContextExerciseFeatureInteractions}
                    />
                </View>
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View >
                    <Text style={{marginRight: 10}}>Context-Exercise Interactions:</Text>
                    <Switch
                        onValueChange={onRatingExerciseInteractionsChange}
                        value={ratingContextExerciseInteractions}
                    />
                </View>
                <View>
                    <Text style={{marginRight: 10}}>Context-Feature Interactions:</Text>
                    <Switch
                        onValueChange={onRatingExerciseFeaturesInteractionsChange}
                        value={ratingContextExerciseFeatureInteractions}
                    />
                </View>
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
                contentContainerStyle={style.exerciseList}
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
        flexDirection: 'column',
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
    exerciseFeatures: {
        marginTop: 8,
    },
    exerciseFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        marginRight: 12,
    },
    exerciseFeatureName: {
        fontWeight: 'bold',
        marginRight: 4,
    },
    exerciseFeatureValue: {},
    exerciseList: {
        paddingHorizontal: 16,
      },
    exerciseBox: {
        flex: 1,
        margin: 4,
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
      },
    exerciseFeatureRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },
})
    
