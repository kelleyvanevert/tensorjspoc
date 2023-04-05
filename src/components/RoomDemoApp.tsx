import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View, Text, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Slider from '@react-native-community/slider';
import { BaseColors } from "./colors";


import { 
    IExercise, 
    Exercises,
    exerciseNames, 
    Moods, 
    IContext, 
    generateContext,
    IRecommendation,
    IEvaluation,
    IScoredExercise,
    IDemoRecommendationEngine,
} from '../recommender/interfaces';

import { ContextComponent } from './ContextComponent';
import { ScoredExercisesList } from './ScoredExercisesList';
import { RecommendedExercises } from './RecommendedExercises';
import { Oracle } from '../recommender/Oracle';
import { DemoRecommendationEngine } from '../recommender/RecommendationEngine';


export function RoomDemoApp() {
    const [exercises, setExercises] = useState<IExercise[]>(Exercises)

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
            // 'defuse',
            // 'zoom_out',
            // 'feeling_stressed',
            // 'feeling_angry',
            'mood_boost',
            'self_compassion',
            'relax',
            'energize',
            // 'feeling_anxious',
            'grounding',
            // 'feeling_blue',
            'focus',
            'shift_perspective',
            'introspect',
            'breathing',
            'article',
            'ACT',
            'Mindfulness',
            'Relaxation',
            'PositivePsychology',
        ]);
    const [clickOracle, setClickOracle] = useState<Oracle>(new Oracle(
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
    const [RatingContextFeatures, setRatingContextFeatures] = useState<string[]>(
        ['happy', 'sad', ]);
    const [RatingExerciseFeatures, setRatingExerciseFeatures] = useState<string[]>([
        'ACT',
        'Mindfulness',
        'Relaxation',
        'PositivePsychology',
    ]);
    
    const [ratingOracle, setRatingOracle] = useState<Oracle>(new Oracle(
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

    const [engine, setEngine] = useState<IDemoRecommendationEngine> (new DemoRecommendationEngine(
        clickOracle,
        ratingOracle,
        exercises,
        softmaxBeta,
        ratingWeight,
    ));

    const [context, setContext] = useState<IContext>(generateContext(Moods[0]));
    const [scoredExercises, setScoredExercises] = useState<IScoredExercise[]>(engine.scoreAllExercises(context));
    const [recommendation, setRecommendation] = useState<IRecommendation>(engine.makeRecommendation(context));
    const [recommendedExercises, setRecommendedExercises] = useState<IExercise[]>(engine.getRecommendedExercises(recommendation))

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
    
    useEffect(() => {        
        recalculateRecommendations(context);
    }, []);

    const recalculateRecommendations = (newContext: IContext) => {
        setContext(newContext);
        const updatedContext = { ...context, ...newContext };

        setScoredExercises(engine.scoreAllExercises(updatedContext))
        setRecommendation(engine.makeRecommendation(updatedContext))
        if (recommendation) {
            setRecommendedExercises(engine.getRecommendedExercises(recommendation))
        }
    }

    const onExerciseSelected = (recommendation2: IRecommendation, exerciseId:string | undefined, starRating:number|undefined) => {
        console.log("onExerciseSelect" , recommendation2, exerciseId, starRating)
        if (exerciseId != undefined) {
            engine.onChooseRecommendedExercise(recommendation2, exerciseId);
        } else {
            engine.onCloseRecommendations(recommendation2);
        }
        if ((starRating != undefined) && (exerciseId != undefined)) {
            const evaluation: IEvaluation = {
                liked: starRating * 20, helpful: starRating * 20,
            }
            engine.onEvaluateExercise(recommendation2.context, recommendation2.context, exerciseId, evaluation);
        }
        recalculateRecommendations(context);
    }

    const onClickLearningRateChange = (value: number) => {
        setClickLearningRate(value);
        engine.clickOracle.learningRate = value;
    }

    const onSelectedClickContextItemsChange = (newContextFeatures: string[]) => {
        setClickContextFeatures(newContextFeatures);
        engine.clickOracle.setFeaturesAndUpdateWeights(
            newContextFeatures, 
            engine.clickOracle.exerciseFeatures,
            engine.clickOracle.exerciseNames,
            engine.clickOracle.addIntercept,
            engine.clickOracle.contextExerciseInteractions,
            engine.clickOracle.contextExerciseFeatureInteractions,
            engine.clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onSelectedClickExerciseItemsChange = (newExerciseFeatures: string[]) => {
        setClickExerciseFeatures(newExerciseFeatures);
        engine.clickOracle.setFeaturesAndUpdateWeights(
            engine.clickOracle.contextFeatures, 
            newExerciseFeatures,
            engine.clickOracle.exerciseNames,
            engine.clickOracle.addIntercept,
            engine.clickOracle.contextExerciseInteractions,
            engine.clickOracle.contextExerciseFeatureInteractions,
            engine.clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onClickExerciseInteractionsChange = (contextExerciseInteractions: boolean) => {
        setClickContextExerciseInteractions(contextExerciseInteractions);
        engine.clickOracle.setFeaturesAndUpdateWeights(
            engine.clickOracle.contextFeatures, 
            engine.clickOracle.exerciseFeatures,
            engine.clickOracle.exerciseNames,
            engine.clickOracle.addIntercept,
            contextExerciseInteractions,
            engine.clickOracle.contextExerciseFeatureInteractions,
            engine.clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onClickExerciseFeaturesInteractionsChange = (contextExerciseFeatureInteractions: boolean) => {
        setClickContextExerciseFeatureInteractions(contextExerciseFeatureInteractions);
        engine.clickOracle.setFeaturesAndUpdateWeights(
            engine.clickOracle.contextFeatures, 
            engine.clickOracle.exerciseFeatures,
            engine.clickOracle.exerciseNames,
            engine.clickOracle.addIntercept,
            engine.clickOracle.contextExerciseInteractions,
            contextExerciseFeatureInteractions,
            engine.clickOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onRatingLearningRateChange = (value: number) => {
        setRatingLearningRate(value);
        engine.ratingOracle.learningRate = value;
    }

    const onSelectedRatingContextItemsChange = (newContextFeatures: string[]) => {
        setRatingContextFeatures(newContextFeatures);
        engine.ratingOracle.setFeaturesAndUpdateWeights(
            newContextFeatures, 
            engine.ratingOracle.exerciseFeatures,
            engine.ratingOracle.exerciseNames,
            engine.ratingOracle.addIntercept,
            engine.ratingOracle.contextExerciseInteractions,
            engine.ratingOracle.contextExerciseFeatureInteractions,
            engine.ratingOracle.getWeightsHash(),
        );
        recalculateRecommendations(context);
    }

    const onSelectedRatingExerciseItemsChange = (newExerciseFeatures: string[]) => {
        setRatingExerciseFeatures(newExerciseFeatures);
        engine.ratingOracle.setFeaturesAndUpdateWeights(
            engine.ratingOracle.contextFeatures, 
            newExerciseFeatures,
            engine.ratingOracle.exerciseNames,
            engine.ratingOracle.addIntercept,
            engine.ratingOracle.contextExerciseInteractions,
            engine.ratingOracle.contextExerciseFeatureInteractions,
            engine.ratingOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onRatingExerciseInteractionsChange = (contextExerciseInteractions: boolean) => {
        setRatingContextExerciseInteractions(contextExerciseInteractions);
        engine.ratingOracle.setFeaturesAndUpdateWeights(
            engine.ratingOracle.contextFeatures, 
            engine.ratingOracle.exerciseFeatures,
            engine.ratingOracle.exerciseNames,
            engine.ratingOracle.addIntercept,
            contextExerciseInteractions,
            engine.ratingOracle.contextExerciseFeatureInteractions,
            engine.ratingOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onRatingExerciseFeaturesInteractionsChange = (contextExerciseFeatureInteractions: boolean) => {
        setRatingContextExerciseFeatureInteractions(contextExerciseFeatureInteractions);
        engine.ratingOracle.setFeaturesAndUpdateWeights(
            engine.ratingOracle.contextFeatures, 
            engine.ratingOracle.exerciseFeatures,
            engine.ratingOracle.exerciseNames,
            engine.ratingOracle.addIntercept,
            engine.ratingOracle.contextExerciseInteractions,
            contextExerciseFeatureInteractions,
            engine.ratingOracle.getWeightsHash(),
            );
        recalculateRecommendations(context);
    }

    const onSoftmaxBetaChange = (value: number) => {
        setSoftmaxBeta(value);
        engine.softmaxBeta = value;
        recalculateRecommendations(context);
    }

    const onRatingWeightChange = (value: number) => {
        setRatingWeight(value);
        engine.softmaxBeta = value;
        recalculateRecommendations(context);
    }

    const renderExercise = ({ item }: { item: IExercise }) => (
        <View style={style.exercise}>
          <Text style={style.exerciseName}>{item.ExerciseName}</Text>
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
      

    return (
        <View>
            <Text style={style.title}>Do EMA</Text>
            <ContextComponent callback={recalculateRecommendations} />
            {
                (() => {
                    if ((recommendation != undefined) &&(recommendedExercises != undefined)){
                        return <RecommendedExercises
                            recommendation={recommendation}
                            recommendedExercises={recommendedExercises}
                            callback={onExerciseSelected}
                        />
                    }
                })()
            }

            <Text style={style.title}>All exercises ranked by probability:</Text>
            <ScoredExercisesList scoredExercises={scoredExercises || []} />

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

            <Text style={style.subtitle}>JSON payload</Text>

            <Text>{clickOracle.toJSON()}</Text>

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
            <Text style={{marginRight: 10}}>Exploitation:</Text>
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
            

            <Text style={style.subtitle}>JSON payload</Text>

            <Text>{ratingOracle.toJSON()}</Text>

            <Text style={style.title}>Exercises details</Text>

            <FlatList
                data={Exercises}
                renderItem={renderExercise}
                keyExtractor={(item) => item.ExerciseId}
                contentContainerStyle={style.exerciseList}
            />

            <Text> {engine.toJSON()}</Text>


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
    
