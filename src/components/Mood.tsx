import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { MoodIndex } from "../interfaces";
import { AppButton } from "./AppButton";
import { BaseColors } from "./colors";


type Props = {
    mood: MoodIndex;
    setMood?: () => void;
};

export function Mood({ mood, setMood }: Props) {

    const [moodValues, setMoodValues] = useState<string[]>([]);

    useEffect(() => { computedButtons() }, [])

    const computedButtons = () => {
        const moods = Object.keys(MoodIndex);
        const moodValues = moods.slice(0, moods.length / 2);
        setMoodValues(moodValues);
    }

    return (
        <View>
            {
                moodValues.map((moodValue, index) =>
                    <AppButton testID={`MoodChoice.${moodValue}`} title={MoodIndex[index]} key={moodValue} />
                )
            }
            <Text style={style.title}>Mood: {mood == undefined ? 'unknown' : MoodIndex[mood]}</Text>
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
})
