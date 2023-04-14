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
import { 
    DefaultClickOracle, 
    DefaultLikingOracle, 
    DefaultHelpfulnessOracle, 
    DefaultRecommendationEngine } from "../recommender/Defaults";

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

  const [clickLearningRate, setClickLearningRate] = useState<number>(DefaultClickOracle.learningRate);
  const [
    clickContextExerciseInteractions,
    setClickContextExerciseInteractions,
  ] = useState<boolean>(DefaultClickOracle.contextExerciseInteractions);
  const [
    clickContextExerciseFeatureInteractions,
    setClickContextExerciseFeatureInteractions,
  ] = useState<boolean>(DefaultClickOracle.contextExerciseFeatureInteractions);
  const [
    clickInversePropensityWeighting,
    setClickInversePropensityWeighting,
  ] = useState<boolean>(DefaultClickOracle.useInversePropensityWeighting);
  const [ClickContextFeatures, setClickContextFeatures] = useState<string[]>(DefaultClickOracle.contextFeatures);
  const [ClickExerciseFeatures, setClickExerciseFeatures] = useState<string[]>(DefaultClickOracle.exerciseFeatures);
  const [clickOracle, setClickOracle] = useState<Oracle>(
    new Oracle(
      ClickContextFeatures, //contextFeatures
      ClickExerciseFeatures, //exerciseFeatures
      exerciseIds, //exerciseNames
      clickLearningRate, //learningRate
      clickContextExerciseInteractions, // contextExerciseInteractions
      clickContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
      clickInversePropensityWeighting, //useInversePropensityWeighting
      DefaultClickOracle.negativeClassWeight,
      DefaultClickOracle.targetLabel, // targetLabel
      DefaultClickOracle.weights, // weights
    )
  );

  const [likingLearningRate, setLikingLearningRate] = useState<number>(DefaultLikingOracle.learningRate);
  const [
    likingContextExerciseInteractions,
    setLikingContextExerciseInteractions,
  ] = useState<boolean>(DefaultLikingOracle.contextExerciseInteractions);
  const [
    likingContextExerciseFeatureInteractions,
    setLikingContextExerciseFeatureInteractions,
  ] = useState<boolean>(DefaultLikingOracle.contextExerciseFeatureInteractions);
  const [
    likingInversePropensityWeighting,
    setLikingInversePropensityWeighting,
  ] = useState<boolean>(DefaultLikingOracle.useInversePropensityWeighting);
  const [LikingContextFeatures, setLikingContextFeatures] = useState<string[]>(DefaultLikingOracle.contextFeatures);
  const [LikingExerciseFeatures, setLikingExerciseFeatures] = useState<
    string[]
  >(DefaultLikingOracle.exerciseFeatures);
  const [likingOracle, setLikingOracle] = useState<Oracle>(
    new Oracle(
      LikingContextFeatures, //contextFeatures
      LikingExerciseFeatures, //exerciseFeatures
      exerciseIds, //exerciseNames
      likingLearningRate, //learningRate
      likingContextExerciseInteractions, // contextExerciseInteractions
      likingContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
      likingInversePropensityWeighting, //useInversePropensityWeighting
      DefaultLikingOracle.negativeClassWeight, //negativeClassWeight
      DefaultLikingOracle.targetLabel, // targetLabel
      DefaultLikingOracle.weights, // weights
    )
  );

  const [helpfulnessLearningRate, setHelpfulnessLearningRate] = useState<number>(DefaultHelpfulnessOracle.learningRate);
  const [
    helpfulnessContextExerciseInteractions,
    setHelpfulnessContextExerciseInteractions,
  ] = useState<boolean>(DefaultHelpfulnessOracle.contextExerciseInteractions);
  const [
    helpfulnessContextExerciseFeatureInteractions,
    setHelpfulnessContextExerciseFeatureInteractions,
  ] = useState<boolean>(DefaultHelpfulnessOracle.contextExerciseFeatureInteractions);
  const [
    helpfulnessInversePropensityWeighting,
    setHelpfulnessInversePropensityWeighting,
  ] = useState<boolean>(DefaultHelpfulnessOracle.useInversePropensityWeighting);
  const [HelpfulnessContextFeatures, setHelpfulnessContextFeatures] = useState<string[]>(DefaultHelpfulnessOracle.contextFeatures);
  const [HelpfulnessExerciseFeatures, setHelpfulnessExerciseFeatures] = useState<
    string[]
  >(DefaultHelpfulnessOracle.exerciseFeatures);
  const [helpfulnessOracle, setHelpfulnessOracle] = useState<Oracle>(
    new Oracle(
      HelpfulnessContextFeatures, //contextFeatures
      HelpfulnessExerciseFeatures, //exerciseFeatures
      exerciseIds, //exerciseNames
      helpfulnessLearningRate, //learningRate
      helpfulnessContextExerciseInteractions, // contextExerciseInteractions
      helpfulnessContextExerciseFeatureInteractions, // contextExerciseFeatureInteractions
      helpfulnessInversePropensityWeighting, //useInversePropensityWeighting
      DefaultHelpfulnessOracle.negativeClassWeight, //negativeClassWeight
      DefaultHelpfulnessOracle.targetLabel, // targetLabel
      DefaultHelpfulnessOracle.weights, // weights
    )
  );

  const [softmaxBeta, setSoftmaxBeta] = useState<number>(DefaultRecommendationEngine.softmaxBeta);
  const [likingWeight, setLikingWeight] = useState<number>(DefaultRecommendationEngine.likingWeight);

  const [engine, setEngine] = useState<IDemoRecommendationEngine>(
    new DemoRecommendationEngine(
      clickOracle,
      likingOracle,
      helpfulnessOracle,
      exercises,
      softmaxBeta,
      1-2*likingWeight,
      likingWeight,
      likingWeight,
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

  const onClickInversePropensityWeightingChange = (value: boolean) => {
    setClickInversePropensityWeighting(value);
    engine.clickOracle.useInversePropensityWeighting = value;
  };

  const onSelectedClickContextItemsChange = (newContextFeatures: string[]) => {
    setClickContextFeatures(newContextFeatures);
    engine.clickOracle.setFeaturesAndUpdateWeights(
      newContextFeatures,
      engine.clickOracle.exerciseFeatures,
      engine.clickOracle.exerciseNames,
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
      engine.clickOracle.contextExerciseInteractions,
      contextExerciseFeatureInteractions,
      engine.clickOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onLikingLearningRateChange = (value: number) => {
    setLikingLearningRate(value);
    engine.likingOracle.learningRate = value;
  };

  const onLikingInversePropensityWeightingChange = (value: boolean) => {
    setLikingInversePropensityWeighting(value);
    engine.likingOracle.useInversePropensityWeighting = value;
  };

  const onSelectedLikingContextItemsChange = (newContextFeatures: string[]) => {
    setLikingContextFeatures(newContextFeatures);
    engine.likingOracle.setFeaturesAndUpdateWeights(
      newContextFeatures,
      engine.likingOracle.exerciseFeatures,
      engine.likingOracle.exerciseNames,
      engine.likingOracle.contextExerciseInteractions,
      engine.likingOracle.contextExerciseFeatureInteractions,
      engine.likingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onSelectedLikingExerciseItemsChange = (
    newExerciseFeatures: string[]
  ) => {
    setLikingExerciseFeatures(newExerciseFeatures);
    engine.likingOracle.setFeaturesAndUpdateWeights(
      engine.likingOracle.contextFeatures,
      newExerciseFeatures,
      engine.likingOracle.exerciseNames,
      engine.likingOracle.contextExerciseInteractions,
      engine.likingOracle.contextExerciseFeatureInteractions,
      engine.likingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onLikingExerciseInteractionsChange = (
    contextExerciseInteractions: boolean
  ) => {
    setLikingContextExerciseInteractions(contextExerciseInteractions);
    engine.likingOracle.setFeaturesAndUpdateWeights(
      engine.likingOracle.contextFeatures,
      engine.likingOracle.exerciseFeatures,
      engine.likingOracle.exerciseNames,
      contextExerciseInteractions,
      engine.likingOracle.contextExerciseFeatureInteractions,
      engine.likingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onLikingExerciseFeaturesInteractionsChange = (
    contextExerciseFeatureInteractions: boolean
  ) => {
    setLikingContextExerciseFeatureInteractions(
      contextExerciseFeatureInteractions
    );
    engine.likingOracle.setFeaturesAndUpdateWeights(
      engine.likingOracle.contextFeatures,
      engine.likingOracle.exerciseFeatures,
      engine.likingOracle.exerciseNames,
      engine.likingOracle.contextExerciseInteractions,
      contextExerciseFeatureInteractions,
      engine.likingOracle.getWeightsHash()
    );
    recalculateRecommendations(context);
  };

  const onSoftmaxBetaChange = (value: number) => {
    setSoftmaxBeta(value);
    engine.softmaxBeta = value;
    recalculateRecommendations(context);
  };

  const onLikingWeightChange = (value: number) => {
    setLikingWeight(value);
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
          <div>Inverse Propensity Weighting:</div>
          <Switch
            onChange={onClickInversePropensityWeightingChange}
            value={clickInversePropensityWeighting}
          />
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
        <div className="text-[10px] font-mono text-gray-600 overflow-auto">
          {clickOracle.toJSON()}
        </div>
      </Section>

      <Section>
        <div className="font-bold text-lg mb-4">Configure LikingOracle</div>

        {/* Slider for learningRate */}
        <div className="mt-4 flex gap-4">
          <div>Learning Rate:</div>
          <Slider
            minimumValue={0.01}
            maximumValue={10.0}
            step={0.01}
            value={likingLearningRate}
            onChange={onLikingLearningRateChange}
          />
          <div>{likingLearningRate.toFixed(2)}</div>
        </div>
        <div className="mt-4 flex gap-4">
          <div>Inverse Propensity Weighting:</div>
          <Switch
            onChange={onLikingInversePropensityWeightingChange}
            value={likingInversePropensityWeighting}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <div>Context-Exercise Interactions:</div>
          <Switch
            onChange={onLikingExerciseInteractionsChange}
            value={likingContextExerciseInteractions}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <div>Context-Feature Interactions:</div>
          <Switch
            onChange={onLikingExerciseFeaturesInteractionsChange}
            value={likingContextExerciseFeatureInteractions}
          />
        </div>
        

        <div className="mt-4">Context features</div>
        <FeatureSelector
          features={Object.keys(context)}
          value={LikingContextFeatures}
          onChange={onSelectedLikingContextItemsChange}
        />

        <div className="mt-4">Exercise features</div>
        <FeatureSelector
          features={Object.keys(Exercises[0].Features)}
          value={LikingExerciseFeatures}
          onChange={onSelectedLikingExerciseItemsChange}
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

        {/* Slider for likingWeight */}
        <div className="mt-4 flex gap-4">
          <div>Liking weight:</div>
          <Slider
            minimumValue={0.0}
            maximumValue={1.0}
            step={0.01}
            value={likingWeight}
            onChange={(value) => {
              setLikingWeight(value);
              //only update on release: TODO fix again
              onLikingWeightChange(value);
            }}
          />
          <div>{likingWeight.toFixed(2)}</div>
        </div>

        <div className="mt-4">JSON payload</div>
        <div className="text-[10px] font-mono text-gray-600 overflow-auto">
                {likingOracle.toJSON()}
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
        <div className="text-[10px] font-mono text-gray-600 overflow-auto">
          {engine.toJSON()}
        </div>
      </Section>
    </div>
  );
}
