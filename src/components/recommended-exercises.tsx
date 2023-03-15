import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-svg";
import { IExcercise, TrainingData } from "../interfaces";
import { ExerciseMathService } from "../services/exercise-math-service";
import { AppButton } from "./AppButton";

type Props = {
    exercises: IExcercise[]
    callback: (exercise: TrainingData[]) => void;
}

type RecommendationState = {
    recommendations: IExcercise[]
}

export function RecommendedExercises({ exercises, callback }: Props) {
    const [recommendation, setRecommendation] = useState<RecommendationState>({ recommendations: [] });

    useEffect(() => {
        const exercisesCopy = exercises.slice()
        let recommendationArray: IExcercise[] = []
        for (let index = 0; index < 3; index++) {
            const sample = ExerciseMathService(exercisesCopy).getSampleFromProbabilityDistributedScores();
            recommendationArray[index] = sample.exercise; // set i-th recommendation
            exercisesCopy.splice(sample.index, 1); // remove the recent recommended item

            const distance = ExerciseMathService(exercisesCopy).getCosineDistance(sample.exercise); // calculate distance between curr and all "remaining" exercises
            const mostSimilarItemToSelectedExercise = distance[distance.length - 1]
            // console.log("Sample -> ", sample.exercise.DisplayName, "\nRemoved Similar -> ", mostSimilarItemToSelectedExercise.exercise.InternalName)
            let indexToRemove = exercisesCopy.findIndex(s => s.InternalName == mostSimilarItemToSelectedExercise.exercise.InternalName)
            exercisesCopy.splice(indexToRemove, 1)
            // remove the last selected value and shrink size by 1
        }
        setRecommendation({ recommendations: recommendationArray });
    }, [exercises])

    const submitRecommendation = (selected?: IExcercise) => {
        if (recommendation?.recommendations != undefined) {
            const exerciseArray: IExcercise[] = recommendation?.recommendations
            let result: TrainingData[] = []
            for (let index = 0; index < exerciseArray.length; index++) {
                if (exerciseArray[index].InternalName == selected?.InternalName) {
                    result.push({
                        input: exerciseArray[index].Value,
                        output: { score: 1 }
                    })
                }
                else {
                    result.push({
                        input: exerciseArray[index].Value,
                        output: { score: 0 }
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
                title={exercise.DisplayName}
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