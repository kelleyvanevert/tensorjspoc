import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
// import { Text } from "react-native-svg";
import { BaseColors } from "./colors";
import { IExcercise, ITrainingData } from "../interfaces";
import { generateOracleTrainingData, sampleRecommendedExercises } from "../services/Bandit";
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
        const recommendedExercises = sampleRecommendedExercises(exercises, softmaxBeta)
        setRecommendation({ recommendations: recommendedExercises, context: context });
    }, [exercises])

    const submitRecommendation = (selected?: IExcercise) => {
        if (recommendation?.recommendations != undefined) {
            const trainingData = generateOracleTrainingData(
                recommendation?.recommendations, 
                selected,
                context,
            );
            callback(trainingData);
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
            <Text style={style.title}>Recommendations:</Text>
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
    title: {
        fontSize: 20,
        lineHeight: 26,
        fontFamily: 'Rubik-Bold',
        color: BaseColors.deepblue,
        marginBottom: 18,
    },
    button: {
        marginBottom: 10,
    }
})
