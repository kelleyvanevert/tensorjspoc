import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-svg";
import { IExcercise, ITrainingData } from "../interfaces";
import { ExerciseMathService } from "../services";
import { AppButton } from "./AppButton";
import { IContext } from "../interfaces";

type Props = {
    context: IContext;
    exercises: IExcercise[]
    softmaxBeta: number;
    callback: (exercise: ITrainingData[]) => void;
}

type RecommendationState = {
    recommendations: IExcercise[],
    context: IContext;
}

export function RecommendedExercises({context, exercises, softmaxBeta, callback }: Props) {
    const [recommendation, setRecommendation] = useState<RecommendationState>({ recommendations: [], context:context});

    useEffect(() => {
        const exercisesCopy = exercises.slice()
        let recommendationArray: IExcercise[] = []
        for (let index = 0; index < 3; index++) {
            const sample = ExerciseMathService(exercisesCopy, softmaxBeta).getSampleFromProbabilityDistributedScores();
            recommendationArray[index] = sample.exercise; // set i-th recommendation
            exercisesCopy.splice(sample.index, 1); // remove the recent recommended item

            const distance = ExerciseMathService(exercisesCopy).getCosineDistance(sample.exercise); // calculate distance between curr and all "remaining" exercises
            const mostSimilarItemToSelectedExercise = distance[distance.length - 1]
            // console.log("Sample -> ", sample.exercise.DisplayName, "\nRemoved Similar -> ", mostSimilarItemToSelectedExercise.exercise.InternalName)
            let indexToRemove = exercisesCopy.findIndex(s => s.InternalName == mostSimilarItemToSelectedExercise.exercise.InternalName)
            exercisesCopy.splice(indexToRemove, 1)
            // remove the last selected value and shrink size by 1
        }
        setRecommendation({ recommendations: recommendationArray, context: context });
    }, [exercises])

    const submitRecommendation = (selected?: IExcercise) => {
        if (recommendation?.recommendations != undefined) {
            const exerciseArray: IExcercise[] = recommendation?.recommendations
            let result: ITrainingData[] = []
            for (let index = 0; index < exerciseArray.length; index++) {
                if (exerciseArray[index].InternalName == selected?.InternalName) {
                    result.push({
                        input: {
                            contextFeatures: recommendation.context,
                            exerciseFeatures: exerciseArray[index].Features,
                        },
                        output: { score: 1 },
                        probability: exerciseArray[index].Probability,
                    })
                }
                else {
                    result.push({
                        input: {
                            contextFeatures: recommendation.context,
                            exerciseFeatures: exerciseArray[index].Features,
                        },
                        output: { score: 0 },
                        probability: exerciseArray[index].Probability,
                    })
                }
            }
            callback(result);
        }
    }

    const renderButton = (exercise: IExcercise) => {
        if (exercise != undefined)
            return <AppButton
                key={exercise.InternalName}
                style={style.button}
                // title is the name of the exercise with probability in brackets:
                title={exercise.DisplayName + " (p=" + Number(exercise.Probability).toFixed(3) + ")"}
                onPress={() => { submitRecommendation(exercise) }}></AppButton>
        else {
            return <Text>Undefined</Text>;
        }
    }

    return (
        <View>
            {
                recommendation.recommendations.map((recommendation) => {
                    return renderButton(recommendation)
                })
            }
            <AppButton
                key={'none_of_the_above'}
                style={style.button}
                title='None of the above'
                onPress={() => submitRecommendation(undefined)}></AppButton>
        </View>
    );
}


const style = StyleSheet.create({
    button: {
        marginBottom: 10
    }
})