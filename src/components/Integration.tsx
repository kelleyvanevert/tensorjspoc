import { useState } from "react";
import {
  createEngineFromJSON,
  createEngineWithDefaults,
  Exercises,
  IRecommendation,
  IRecommendationEngine,
} from "../recommender/interfaces";
import { AppButton } from "./AppButton";
import { Section } from "./Section";

/** Just using the same test data, this data would come from the Cms in the ROOM app */
const exercises = Exercises;

/**
 * An absolutely minimal 'stub' of the ROOM app, just to demonstrate how it will
 * interact with the recommendation engine
 */
export function Integration() {
  const [recommendationEngine, setRecommendationEngine] =
    useState<IRecommendationEngine>();
  const [recommendationState, setRecommendationState] = useState<string>();
  const [recommendation, setRecommendation] = useState<IRecommendation>();

  function createRE() {
    setRecommendationEngine(createEngineWithDefaults(exercises));
  }

  function restoreRE() {
    if (recommendationState) {
      setRecommendationEngine(
        createEngineFromJSON(recommendationState, exercises)
      );
    } else {
      console.warn("Create and persist RE first!");
    }
  }

  function persistRE() {
    if (recommendationEngine) {
      setRecommendationState(recommendationEngine.toJSON());
    } else {
      console.warn("Create RE first!");
    }
  }

  function inspectREState() {
    console.log(recommendationState);
  }

  function getHappyRecommendation() {
    setRecommendation(
      recommendationEngine?.makeRecommendation({ happy: 1, sad: 0 })
    );
  }

  function getSadRecommendation() {
    setRecommendation(
      recommendationEngine?.makeRecommendation({ happy: 0, sad: 1 })
    );
  }

  function visitRecommendedExercise() {
    if (recommendation && recommendationEngine) {
      const randomIndex = Math.floor(
        Math.random() * recommendation.recommendedExercises.length
      );
      recommendationEngine.onChooseRecommendedExercise(
        recommendation,
        recommendation.recommendedExercises[randomIndex].exerciseId
      );
    }
  }

  return (
    <div>
      <Section>
        <h1 className="text-xl font-bold mb-4">Integration:</h1>

        <div className="flex flex-wrap gap-2">
          <AppButton title="Create new RE" onClick={createRE} />
          <AppButton title="Restore RE from JSON" onClick={restoreRE} />
          <AppButton title="Persist RE state as JSON" onClick={persistRE} />
          <AppButton title="Inspect RE state JSON" onClick={inspectREState} />
        </div>
      </Section>

      {recommendationEngine ? (
        <>
          <Section>
            <div className="font-bold text-lg mb-4">Inputs:</div>
            {recommendation && (
              <AppButton
                title="Visit a recommended exercise"
                onClick={visitRecommendedExercise}
              />
            )}
          </Section>

          <Section>
            <div className="font-bold text-lg mb-4">Output:</div>
            <div className="flex flex-wrap gap-2">
              <AppButton
                title="Get happy recommendation"
                onClick={getHappyRecommendation}
              />
              <AppButton
                title="Get sad recommendation"
                onClick={getSadRecommendation}
              />
            </div>
          </Section>
        </>
      ) : (
        <div>No Recommendation Engine.</div>
      )}

      {recommendation ? (
        <Section>
          <div className="font-bold text-lg mb-4">Recommendation:</div>
          {recommendation.recommendedExercises.map((el) => (
            <div key={el.exerciseId} className="mb-2">
              <div className="font-semibold">{el.exerciseId}</div>
              <div className="text-sm text-gray-500">
                prob: {el.probability.toFixed(4)} — score: {el.score.toFixed(4)}
              </div>
            </div>
          ))}
        </Section>
      ) : (
        <div>No recommendations.</div>
      )}
    </div>
  );
}
