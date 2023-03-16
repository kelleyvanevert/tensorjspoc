import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { IExcercise } from '../interfaces';
import { BaseColors } from './colors';

type Props = {
    recommendations: IExcercise[]
}

export function ExerciseScores({ recommendations }: Props) {
    return (<FlatList data={recommendations || []}
        keyExtractor={(item) => item.InternalName}
        style={style.list}
        renderItem={({ item }) => <View style={style.item}>
            <Text accessibilityRole={'text'} style={style.paragraph}>Name: {item.DisplayName}</Text>
            <Text accessibilityRole={'text'} style={style.paragraph}>Score: {Math.round((item.Score || 0) * 100)}</Text>
            <Text accessibilityRole={'text'} style={style.paragraph}>Proba: {Math.round((item.Probability || 0) * 10000) / 100}</Text>
        </View>}></FlatList>);
}

const style = StyleSheet.create({
    paragraph: {
        fontSize: 15,
        lineHeight: 26,
        fontFamily: 'Rubik',
        color: BaseColors.deepblue,
    },
    list: {
        marginTop: 10
    },
    item: {
        marginBottom: 5
    }
})