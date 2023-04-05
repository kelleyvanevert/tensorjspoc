import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";

import { AppButton } from "./AppButton";
import { BaseColors } from "./colors";

import { Mood, Moods, IContext, generateContext } from "../recommender/interfaces";


type Props = {
    callback: (context: IContext) => void;
};

export function ContextComponent({ callback }: Props) {

    const [moodValues] = useState<Mood[]>(Moods);
    const [currentMood, setCurrentMood] = useState<Mood>(moodValues[0])

    const onMoodPress = (mood: Mood) => {
        setCurrentMood(mood)
        callback(generateContext(mood));
    }

    return (
        <View>
            {
                moodValues.map((mood: Mood) =>
                    <AppButton 
                        style={style.button} 
                        testID={`MoodChoice.${mood.name}`} 
                        title={mood.name} 
                        key={mood.value} 
                        onPress={() => onMoodPress(mood)} 
                    />
                )
            }
            <Text style={style.title}>Mood: {currentMood.name}</Text>
        </View>);
}

const style = StyleSheet.create({
    title: {
        fontSize: 20,
        lineHeight: 26,
        fontFamily: 'Rubik-Bold',
        color: BaseColors.green,
        marginBottom: 18,
        textAlign: 'center',
    },
    button: {
        marginBottom: 10
    }
})
