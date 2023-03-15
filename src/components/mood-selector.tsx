import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Mood, Moods } from "../interfaces";
import { AppButton } from "./AppButton";
import { BaseColors } from "./colors";


type Props = {
    initialMood: Mood
    callback: (mood: Mood) => void;
};

export function MoodComponent({ initialMood, callback }: Props) {

    const [current, setCurrentMood] = useState<Mood>(initialMood)
    const [moodValues] = useState<Mood[]>(Moods);

    const updateMood = (mood: Mood) => {
        setCurrentMood(mood);
        callback(mood);
    }

    return (
        <View>
            {
                moodValues.map((mood: Mood) =>
                    <AppButton style={style.button} testID={`MoodChoice.${mood.name}`} title={mood.name} key={mood.value} onPress={() => updateMood(mood)} />
                )
            }
            <Text style={style.title}>Mood: {current?.name}</Text>
        </View>);
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
        marginBottom: 10
    }
})
