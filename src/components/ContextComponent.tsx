import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Mood, Moods, IContext, generateContext } from "../interfaces";
import { AppButton } from "./AppButton";
import { BaseColors } from "./colors";


type Props = {
    // initialContext: IContext,
    callback: (context: IContext) => void;
};


export function ContextComponent({ callback }: Props) {

    //const [current, setCurrentContext] = useState<IContext>(initialContext)
    const [moodValues] = useState<Mood[]>(Moods);
    const [currentMood, setCurrentMood] = useState<Mood>(moodValues[0])

    
    const onMoodPress = (mood: Mood) => {
        setCurrentMood(mood)
        //const newContext: IContext = {mood: currentMood.value}
        //setCurrentContext(newContext);
        callback(generateContext(mood));
    }
    // updateContext(currentMood)

    return (
        <View>
            {
                moodValues.map((mood: Mood) =>
                    <AppButton 
                        style={style.button} 
                        testID={`MoodChoice.${mood.name}`} 
                        title={mood.name + " (" + mood.value + ")"} 
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
        color: BaseColors.deepblue,
        marginBottom: 18,
    },
    button: {
        marginBottom: 10
    }
})
