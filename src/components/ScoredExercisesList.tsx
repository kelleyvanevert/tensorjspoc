import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { IScoredExercise } from '../interfaces';
import { BaseColors } from './colors';

type Props = {
    scoredExercises: IScoredExercise[]
}

export function ScoredExercisesList({ scoredExercises }: Props) {
    return (
        <FlatList
            data={scoredExercises || []}
            keyExtractor={(item) => item.ExerciseId}
            style={styles.list}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Text style={styles.title}>{item.ExerciseName}</Text>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.label}>Click:</Text>
                        <Text style={styles.score}>{Math.round((item.ClickScore || 0) * 100)}</Text>
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.label}>Rating:</Text>
                        <Text style={styles.score}>{Math.round((item.RatingScore || 0) * 50) / 10}</Text>
                    </View>
                    <View style={styles.probaContainer}>
                        <Text style={styles.label}>Proba:</Text>
                        <Text style={styles.proba}>{Math.round((item.Probability || 0) * 10000) / 100}%</Text>
                    </View>
                </View>
            )}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    item: {
        flex: 1,
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: BaseColors.deepblue,
        marginBottom: 5,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: BaseColors.deepblue,
        marginRight: 5,
    },
    score: {
        fontSize: 16,
        fontWeight: 'normal',
        color: BaseColors.green,
    },
    probaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proba: {
        fontSize: 16,
        fontWeight: 'normal',
        color: BaseColors.orange,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginHorizontal: 5,
    }
})
