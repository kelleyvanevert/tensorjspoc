import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity } from "react-native";
import StarRating from "react-native-star-rating";

import { BaseColors } from "./colors";
import { AppButton } from "./AppButton";

import { IExercise, IRecommendation } from "../recommender/interfaces";

type Props = {
    recommendation: IRecommendation;
    recommendedExercises: IExercise[];
    callback: (recommendation: IRecommendation, exerciseId: string | undefined, rating: number | undefined) => void;
}


export function RecommendedExercises({recommendation, recommendedExercises, callback}: Props) {
    const [oldRecommendation, setOldRecommendation] = useState<IRecommendation>(recommendation);
    const [selectedExercise, setSelectedExercise] = useState<IExercise>();
    const [ratingModalVisible, setRatingModalVisible] = useState(false);    

    useEffect(() => {
        
    }, [recommendation, recommendedExercises])

    const submitRecommendation = (starRating:number | undefined) => {
        // console.log("submitRecommendation", oldRecommendation, recommendation)
        callback(oldRecommendation, selectedExercise?.ExerciseId, starRating);
        setSelectedExercise(undefined);
        setRatingModalVisible(false);
        setOldRecommendation(recommendation);
    }

    const renderButton = (exercise: IExercise) => {
        if (exercise != undefined)
            return <AppButton
                key={exercise.ExerciseId}
                style={style.button}
                title={exercise.ExerciseName}
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
                recommendedExercises.map((recommendation) => {
                    return renderButton(recommendation)
                })
            }
            <AppButton
                key={'none_of_the_above'}
                style={style.button}
                title='None of the above'
                onPress={() => {
                    setSelectedExercise(undefined);
                    submitRecommendation(undefined);
                }}></AppButton>

            <Modal
                visible={ratingModalVisible}
                animationType="slide"
                transparent={true}>
                <View style={style.modalContainer}>
                    <View style={style.modalContent}>
                        <Text style={style.modalTitle}>Rate {selectedExercise?.ExerciseName}</Text>
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
