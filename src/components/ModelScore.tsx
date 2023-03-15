import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { IExcercise } from '../interfaces';
import { BaseColors } from './colors';

type Props = {
    recommendations: IExcercise[]
}

export function ModelScores({ recommendations }: Props) {
    return (<FlatList data={recommendations || []}
        keyExtractor={(item) => item.InternalName}
        style={style.list}
        renderItem={({ item }) => <View style={style.item}>
            <Text style={style.paragraph}>Name: {item.DisplayName}</Text>
            <Text style={style.paragraph}>Score: {Math.round((item.Score || 0) * 100)}</Text>
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