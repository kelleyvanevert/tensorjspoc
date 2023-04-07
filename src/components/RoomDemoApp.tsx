import { useEffect, useState } from "react";
import {
  IExercise,
  Exercises,
  exerciseIds,
  Moods,
  IContext,
  generateContext,
  IRecommendation,
  IEvaluation,
  IScoredExercise,
  IDemoRecommendationEngine,
} from "../recommender/interfaces";

import { ContextComponent } from "./ContextComponent";
import { ScoredExercisesList } from "./ScoredExercisesList";
import { RecommendedExercises } from "./RecommendedExercises";
import { Oracle } from "../recommender/Oracle";
import { DemoRecommendationEngine } from "../recommender/RecommendationEngine";
import { Switch } from "./Switch";
import { Slider } from "./Slider";
import { Section } from "./Section";
import { FeatureSelector } from "./FeatureSelector";

export function RoomDemoApp() {
  const [exercises, setExercises] = useState<IExercise[]>(Exercises);

  const [clickLearningRate, setClickLearningRate] = useState<number>(0.01);
  const [clickAddIntercept, setClickAddIntercept] = useState<boolean>(true);
  const [
    clickContextExerciseInteractions,
    setClickContextExerciseInteractions,
  ] = useState<boolean>(true);
  const [
    clickContextExerciseFeatureInteractions,
    setClickContextExerciseFeatureInteractions,
  ] = useState<boolean>(true);

  const [ClickContextFeatures, setClickContextFeatures] = useState<string[]>([
    "happy",
    "sad",
  ]);
  const [ClickExerciseFeatures, setClickExerciseFeatures] = useState<string[]>([
    "three_five_mins",
    "five_seven_mins",
    "seven_ten_mins",
    // 'defuse',
    // 'zoom_out',
    // 'feeling_stressed',
    // 'feeling_angry',
    "mood_boost",
    "self_compassion",
    "relax",
    "energize",
    // 'feeling_anxious',
    "grounding",
    // 'feeling_blue',
    "focus",
    "shift_perspective",
    "introspect",
    "breathing",
    "article",
    "ACT",
    "Mindfulness",
    "Relaxation",
    "PositivePsychology",
  ]);
  const [clickOracle, setClickOracle] = useState<Oracle>(
    new Oracle(
      ClickContextFeatures, //contextFeatures
      ClickExerciseFeatures, //exerciseFeatures
      exerciseIds, //exerciseNames
      clickLearningRate, //learningRate
      1, //iterations
      clickAddIntercept, //addIntercept
      clickContextExerciseInteractions, // contextExerciseInteractions
      clickContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
      true, //useInversePropensityWeighting
      false, //useInversePropensityWeightingPositiveOnly
      "clicked" // targetLabel
    )
  );

  const [ratingLearningRate, setRatingLearningRate] = useState<number>(2.0);
  const [ratingAddIntercept, setRatingAddIntercept] = useState<boolean>(true);
  const [
    ratingContextExerciseInteractions,
    setRatingContextExerciseInteractions,
  ] = useState<boolean>(true);
  const [
    ratingContextExerciseFeatureInteractions,
    setRatingContextExerciseFeatureInteractions,
  ] = useState<boolean>(false);
  const [RatingContextFeatures, setRatingContextFeatures] = useState<string[]>([
    "happy",
    "sad",
  ]);
  const [RatingExerciseFeatures, setRatingExerciseFeatures] = useState<
    string[]
  >(["ACT", "Mindfulness", "Relaxation", "PositivePsychology"]);

  const [ratingOracle, setRatingOracle] = useState<Oracle>(
    new Oracle(
      RatingContextFeatures, //contextFeatures
      RatingExerciseFeatures, //exerciseFeatures
      exerciseIds, //exerciseNames
      ratingLearningRate, //learningRate
      1, //iterations
      ratingAddIntercept, //addIntercept
      ratingContextExerciseInteractions, // contextExerciseInteractions
      ratingContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
      false, //useInversePropensityWeighting
      false, //useInversePropensityWeightingPositiveOnly
      "rating" // targetLabel
    )
  );
  const [softmaxBeta, setSoftmaxBeta] = useState<number>(2);
  const [ratingWeight, setRatingWeight] = useState<number>(0.2);

  const [engine, setEngine] = useState<IDemoRecommendationEngine>(
    new DemoRecommendationEngine(
      clickOracle,
      ratingOracle,
      exercises,
      softmaxBeta,
      ratingWeight
    )
  );

  const [context, setContext] = useState<IContext>(generateContext(Moods[0]));
  const [scoredExercises, setScoredExercises] = useState<IScoredExercise[]>(
    engine.scoreAllExercises(context)
  );
  const [recommendation, setRecommendation] = useState<IRecommendation>(
    engine.makeRecommendation(context)
  );
  const [recommendedExercises, setRecommendedExercises] = useState<IExercise[]>(
    engine.getRecommendedExercises(recommendation)
  );

  useEffect(() => {
    recalculateRecommendations(context);
  }, []);

  const recalculateRecommendations = (newContext: IContext) => {
    setContext(newContext);
    const updatedContext = { ...context, ...newContext };

    setScoredExercises(engine.scoreAllExercises(updatedContext));
    setRecommendation(engine.makeRecommendation(updatedContext));
    if (recommendation) {
      setRecommendedExercises(engine.getRecommendedExercises(recommendation));
    }
  };

  const onExerciseSelected = (
    recommendation2: IRecommendation,
    exerciseId: string | undefined,
    starRating: number | undefined
  ) => {
    console.log("onExerciseSelect", recommendation2, exerciseId, starRating);
    if (exerciseId != undefined) {
      engine.onChooseRecommendedExercise(recommendation2, exerciseId);
    } else {
      engine.onCloseRecommendations(recommendation2);
    }
    if (starRating != undefined && exerciseId != undefined) {
      const evaluation: IEvaluation = {
        liked: starRating * 20,
        helpful: starRating * 20,
      };
      engine.onEvaluateExercise(
        recommendation2.context,
        recommendation2.context,
        exerciseId,
        evaluation
      );
    }
    recalculateRecommendations(context);
  };

  const onClickLearningRateChange = (value: number) => {
    setClickLearningRate(value);
    engine.clickOracle.learningRate = value;
  };

  const onSelectedClickContextItemsChange = (newContextFeatures: string[]) => {
    setClickContextFeatures(newContextFeatures);
    engine.clickOracle.setFeaturesAndUpdateWeights(
      newContextFeatures,
      engine.clickOracle.exerciseFeatures,
      engine.clickOracle.exerciseNames,
      engine.clickOracle.addIntercept,
      engine.clickOracle.contextExerciseInteractions,
      engine.clickOracle.contextExerciseFeatureInteractions,
      engine.clickOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onSelectedClickExerciseItemsChange = (
    newExerciseFeatures: string[]
  ) => {
    setClickExerciseFeatures(newExerciseFeatures);
    engine.clickOracle.setFeaturesAndUpdateWeights(
      engine.clickOracle.contextFeatures,
      newExerciseFeatures,
      engine.clickOracle.exerciseNames,
      engine.clickOracle.addIntercept,
      engine.clickOracle.contextExerciseInteractions,
      engine.clickOracle.contextExerciseFeatureInteractions,
      engine.clickOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onClickExerciseInteractionsChange = (
    contextExerciseInteractions: boolean
  ) => {
    setClickContextExerciseInteractions(contextExerciseInteractions);
    engine.clickOracle.setFeaturesAndUpdateWeights(
      engine.clickOracle.contextFeatures,
      engine.clickOracle.exerciseFeatures,
      engine.clickOracle.exerciseNames,
      engine.clickOracle.addIntercept,
      contextExerciseInteractions,
      engine.clickOracle.contextExerciseFeatureInteractions,
      engine.clickOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onClickExerciseFeaturesInteractionsChange = (
    contextExerciseFeatureInteractions: boolean
  ) => {
    setClickContextExerciseFeatureInteractions(
      contextExerciseFeatureInteractions
    );
    engine.clickOracle.setFeaturesAndUpdateWeights(
      engine.clickOracle.contextFeatures,
      engine.clickOracle.exerciseFeatures,
      engine.clickOracle.exerciseNames,
      engine.clickOracle.addIntercept,
      engine.clickOracle.contextExerciseInteractions,
      contextExerciseFeatureInteractions,
      engine.clickOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onRatingLearningRateChange = (value: number) => {
    setRatingLearningRate(value);
    engine.ratingOracle.learningRate = value;
  };

  const onSelectedRatingContextItemsChange = (newContextFeatures: string[]) => {
    setRatingContextFeatures(newContextFeatures);
    engine.ratingOracle.setFeaturesAndUpdateWeights(
      newContextFeatures,
      engine.ratingOracle.exerciseFeatures,
      engine.ratingOracle.exerciseNames,
      engine.ratingOracle.addIntercept,
      engine.ratingOracle.contextExerciseInteractions,
      engine.ratingOracle.contextExerciseFeatureInteractions,
      engine.ratingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onSelectedRatingExerciseItemsChange = (
    newExerciseFeatures: string[]
  ) => {
    setRatingExerciseFeatures(newExerciseFeatures);
    engine.ratingOracle.setFeaturesAndUpdateWeights(
      engine.ratingOracle.contextFeatures,
      newExerciseFeatures,
      engine.ratingOracle.exerciseNames,
      engine.ratingOracle.addIntercept,
      engine.ratingOracle.contextExerciseInteractions,
      engine.ratingOracle.contextExerciseFeatureInteractions,
      engine.ratingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onRatingExerciseInteractionsChange = (
    contextExerciseInteractions: boolean
  ) => {
    setRatingContextExerciseInteractions(contextExerciseInteractions);
    engine.ratingOracle.setFeaturesAndUpdateWeights(
      engine.ratingOracle.contextFeatures,
      engine.ratingOracle.exerciseFeatures,
      engine.ratingOracle.exerciseNames,
      engine.ratingOracle.addIntercept,
      contextExerciseInteractions,
      engine.ratingOracle.contextExerciseFeatureInteractions,
      engine.ratingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onRatingExerciseFeaturesInteractionsChange = (
    contextExerciseFeatureInteractions: boolean
  ) => {
    setRatingContextExerciseFeatureInteractions(
      contextExerciseFeatureInteractions
    );
    engine.ratingOracle.setFeaturesAndUpdateWeights(
      engine.ratingOracle.contextFeatures,
      engine.ratingOracle.exerciseFeatures,
      engine.ratingOracle.exerciseNames,
      engine.ratingOracle.addIntercept,
      engine.ratingOracle.contextExerciseInteractions,
      contextExerciseFeatureInteractions,
      engine.ratingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onSoftmaxBetaChange = (value: number) => {
    setSoftmaxBeta(value);
    engine.softmaxBeta = value;
    recalculateRecommendations(context);
  };

  const onRatingWeightChange = (value: number) => {
    setRatingWeight(value);
    engine.softmaxBeta = value;
    recalculateRecommendations(context);
  };

  const renderExercise = ({ item }: { item: IExercise }) => (
    <div>
      <div className="font-semibold">{item.ExerciseName}</div>
      <div className="text-sm">
        {Object.entries(item.Features)
          .filter((t) => t[1] === 1)
          .map((t) => t[0])
          .join(", ")}
      </div>
    </div>
  );

  return (
    <div>
      <Section>
        <div className="font-bold text-lg mb-4">Do EMA</div>
        <ContextComponent callback={recalculateRecommendations} />
      </Section>

      {recommendation != undefined && recommendedExercises != undefined && (
        <RecommendedExercises
          recommendation={recommendation}
          recommendedExercises={recommendedExercises}
          callback={onExerciseSelected}
        />
      )}

      <Section>
        <div className="font-bold text-lg mb-4">
          All exercises ranked by probability:
        </div>
        <ScoredExercisesList scoredExercises={scoredExercises || []} />
      </Section>

      <Section>
        <div className="font-bold text-lg mb-4">Configure ClickOracle</div>

        <div className="mt-4 flex gap-4">
          <div style={{ marginRight: 10 }}>Learning Rate:</div>
          <Slider
            minimumValue={0.01}
            maximumValue={0.5}
            step={0.01}
            value={clickLearningRate}
            onChange={onClickLearningRateChange}
          />
          <div>{clickLearningRate.toFixed(2)}</div>
        </div>

        <div className="mt-4 flex gap-4">
          <div>Context-Exercise Interactions:</div>
          <Switch
            onChange={onClickExerciseInteractionsChange}
            value={clickContextExerciseInteractions}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <div>Context-Feature Interactions:</div>
          <Switch
            onChange={onClickExerciseFeaturesInteractionsChange}
            value={clickContextExerciseFeatureInteractions}
          />
        </div>

        <div className="mt-3">Context features</div>
        <FeatureSelector
          features={Object.keys(context)}
          value={ClickContextFeatures}
          onChange={onSelectedClickContextItemsChange}
        />

        <div className="mt-3">Exercise features</div>
        <FeatureSelector
          features={Object.keys(Exercises[0].Features)}
          value={ClickExerciseFeatures}
          onChange={onSelectedClickExerciseItemsChange}
        />

        <div className="mt-4">JSON payload</div>
        <div className="text-[10px] font-mono text-gray-600">
          {clickOracle.toJSON()}
        </div>
      </Section>

      <Section>
        <div className="font-bold text-lg mb-4">Configure RatingOracle</div>

        {/* Slider for learningRate */}
        <div className="mt-4 flex gap-4">
          <div>Learning Rate:</div>
          <Slider
            minimumValue={0.01}
            maximumValue={10.0}
            step={0.01}
            value={ratingLearningRate}
            onChange={onRatingLearningRateChange}
          />
          <div>{ratingLearningRate.toFixed(2)}</div>
        </div>

        <div className="mt-4 flex gap-4">
          <div>Context-Exercise Interactions:</div>
          <Switch
            onChange={onRatingExerciseInteractionsChange}
            value={ratingContextExerciseInteractions}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <div>Context-Feature Interactions:</div>
          <Switch
            onChange={onRatingExerciseFeaturesInteractionsChange}
            value={ratingContextExerciseFeatureInteractions}
          />
        </div>

        <div className="mt-4">Context features</div>
        <FeatureSelector
          features={Object.keys(context)}
          value={RatingContextFeatures}
          onChange={onSelectedRatingContextItemsChange}
        />

        <div className="mt-4">Exercise features</div>
        <FeatureSelector
          features={Object.keys(Exercises[0].Features)}
          value={RatingExerciseFeatures}
          onChange={onSelectedRatingExerciseItemsChange}
        />
      </Section>

      <Section>
        <div className="font-bold text-lg mb-4">Configure Recommender</div>

        {/* Slider for softmaxBeta */}
        <div className="mt-4 flex gap-4">
          <div>Exploitation:</div>
          <Slider
            minimumValue={0.5}
            maximumValue={10}
            step={0.5}
            value={softmaxBeta}
            onChange={onSoftmaxBetaChange}
          />
          <div>{softmaxBeta.toFixed(1)}</div>
        </div>

        {/* Slider for ratingWeight */}
        <div className="mt-4 flex gap-4">
          <div>Rating weight:</div>
          <Slider
            minimumValue={0.0}
            maximumValue={1.0}
            step={0.01}
            value={ratingWeight}
            onChange={(value) => {
              setRatingWeight(value);
              //only update on release: TODO fix again
              onRatingWeightChange(value);
            }}
          />
          <div>{ratingWeight.toFixed(2)}</div>
        </div>

        <div className="mt-4">JSON payload</div>
        <div className="text-[10px] font-mono text-gray-600">
          {ratingOracle.toJSON()}
        </div>
      </Section>

      <Section>
        <div className="font-bold text-lg mb-4">Exercises details</div>

        <div className="flex flex-col gap-3">
          {exercises.map((item) => renderExercise({ item }))}
        </div>
      </Section>

      <Section>
        <div className="font-bold text-lg mb-4">Engine details</div>
        <div className="text-[10px] font-mono text-gray-600">
          {engine.toJSON()}
        </div>
      </Section>
    </div>
  );
}
