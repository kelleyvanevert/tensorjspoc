import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity } from "react-native";
import { BaseColors } from "./colors";
import StarRating from "react-native-star-rating";
import { IExcercise, ITrainingData } from "../interfaces";
import { generateOracleTrainingDataFromSelection, sampleRecommendations } from "../services/Bandit";
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
    const [selectedExercise, setSelectedExercise] = useState<IExcercise>();
    const [ratingModalVisible, setRatingModalVisible] = useState(false);    

    useEffect(() => {
        const recommendedExercises = sampleRecommendations(exercises, softmaxBeta)
        setRecommendation({ recommendations: recommendedExercises, context: context });
    }, [exercises])

    const submitRecommendation = (starRating:number | undefined) => {
        if (recommendation?.recommendations != undefined) {
            // console.log("starRating: " + starRating);
            const trainingData = generateOracleTrainingDataFromSelection(
                recommendation?.recommendations, 
                selectedExercise,
                context,
                starRating,
            );
            callback(trainingData);
            setSelectedExercise(undefined);
            setRatingModalVisible(false);
        }
    }

    const renderButton = (exercise: IExcercise) => {
        if (exercise != undefined)
            return <AppButton
                key={exercise.InternalName}
                style={style.button}
                // title is the name of the exercise with probability in brackets:
                title={exercise.DisplayName + " (p=" + Number(exercise.Probability).toFixed(3) + ")"}
                onPress={() => {
                    setSelectedExercise(exercise);
                    setRatingModalVisible(true);
                }}></AppButton>
        else {
            return <Text>Undefined</Text>;
        }
    }

    return (
        <View>
            <Text style={style.title}>Your Recommendations:</Text>
            {
                recommendation.recommendations.map((recommendation) => {
                    return renderButton(recommendation)
                })
            }
            <AppButton
                key={'none_of_the_above'}
                style={style.button}
                title='None of the above'
                onPress={() => {
                    setSelectedExercise(undefined);
                    submitRecommendation(-1);
                }}></AppButton>

            <Modal
                visible={ratingModalVisible}
                animationType="slide"
                transparent={true}>
                <View style={style.modalContainer}>
                    <View style={style.modalContent}>
                        <Text style={style.modalTitle}>Rate {selectedExercise?.DisplayName}</Text>
                        <StarRating
                            starSize={40}
                            disabled={false}
                            maxStars={5}
                            rating={0}
                            selectedStar={(rating:number) => { 
                                submitRecommendation(rating)
                            }}
                            fullStarColor={BaseColors.orange}
                        />

                        <TouchableOpacity
                            style={style.modalButton}
                            onPress={() => { 
                                submitRecommendation(undefined) 
                            }
                            }>
                            <Text style={style.modalButtonText}>No rating</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const style = StyleSheet.create({
    title: {
      fontSize: 20,
      lineHeight: 26,
      fontFamily: "Rubik-Bold",
      color: BaseColors.deepblue,
      marginBottom: 18,
    },
    button: {
      marginBottom: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      elevation: 5,
    },
    modalTitle: {
      fontFamily: "Rubik-Bold",
      fontSize: 20,
      marginBottom: 20,
    },
    modalButton: {
      marginTop: 20,
      backgroundColor: BaseColors.orange,
      padding: 10,
      borderRadius: 5,
      minWidth: 100,
      alignItems: "center",
    },
    modalButtonText: {
      fontFamily: "Rubik-Bold",
      fontSize: 16,
      color: "white",
    },
  });
