import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton} from '../components/AppButton';
import {BaseColors} from '../components/colors';
import {MenuBar} from '../components/MenuBar';
import {Exercises, IRecommendation, IRecommendationEngine} from '../interfaces';
import {RecommendationEngine} from '../services/RecommendationEngine';

/** Just using the same test data, this data would come from the Cms in the ROOM app */
const exercises = Exercises;

/**
 * An absolutely minimal 'stub' of the ROOM app, just to demonstrate how it will
 * interact with the recommendation engine
 */
export function ExampleScreen() {
  const insets = useSafeAreaInsets();
  const [recommendationEngine, setRecommendationEngine] =
    useState<IRecommendationEngine>();
  const [recommendationState, setRecommendationState] = useState<string>();
  const [recommendation, setRecommendation] = useState<IRecommendation>();

  function createRE() {
    setRecommendationEngine(RecommendationEngine.createNew(exercises));
  }

  function restoreRE() {
    if (recommendationState) {
      setRecommendationEngine(
        RecommendationEngine.fromJSON(recommendationState, exercises),
      );
    } else {
      console.warn('Create and persist RE first!');
    }
  }

  function persistRE() {
    if (recommendationEngine) {
      setRecommendationState(recommendationEngine.toJSON());
    } else {
      console.warn('Create RE first!');
    }
  }

  function inspectREState() {
    console.log(recommendationState);
  }

  function getHappyRecommendation() {
    setRecommendation(
      recommendationEngine?.makeRecommendation({happy: 1, sad: 0}),
    );
  }

  function getSadRecommendation() {
    setRecommendation(
      recommendationEngine?.makeRecommendation({happy: 0, sad: 1}),
    );
  }

  function visitRecommendedExercise() {
    if (recommendation && recommendationEngine) {
      const randomIndex = Math.floor(
        Math.random() * recommendation.recommendedExercises.length,
      );
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        recommendation.recommendedExercises[randomIndex].exerciseId,
      );
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={{height: insets.top + 24}} />

      <MenuBar />

      <View style={styles.section}>
        <Text style={styles.title}>Integration:</Text>
        <AppButton title="Create new RE" onPress={createRE} />
        <AppButton title="Restore RE from JSON" onPress={restoreRE} />
        <AppButton title="Persist RE state as JSON" onPress={persistRE} />
        <AppButton title="Inspect RE state JSON" onPress={inspectREState} />
      </View>

      {recommendationEngine ? (
        <>
          <View style={styles.section}>
            <Text style={styles.title}>Inputs:</Text>
            {recommendation && (
              <AppButton
                title="Visit a recommended exercise"
                onPress={visitRecommendedExercise}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>Output:</Text>
            <AppButton
              title="Get happy recommendation"
              onPress={getHappyRecommendation}
            />
            <AppButton
              title="Get sad recommendation"
              onPress={getSadRecommendation}
            />
          </View>
        </>
      ) : (
        <Text style={styles.title}>No Recommendation Engine.</Text>
      )}

      {recommendation ? (
        <View style={styles.section}>
          <Text style={styles.title}>Recommendation:</Text>
          {recommendation.recommendedExercises.map(el => (
            <Text style={styles.title} key={el.exerciseId}>
              {el.exerciseId} | {el.probability} | {el.score}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.title}>No recommendations.</Text>
      )}

      <View style={{height: insets.bottom + 24}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: BaseColors.offwhite,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Rubik-Bold',
    color: BaseColors.deepblue,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Rubik',
    color: BaseColors.deepblue,
    marginBottom: 12,
  },
  section: {
    borderColor: BaseColors.mediumLila,
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
});
