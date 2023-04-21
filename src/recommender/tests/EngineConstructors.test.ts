import {
  createEngineWithDefaults,
  createEngineForDemographicsAndNeeds,
  createEngineFromJSON,
  IExerciseData,
  generateExerciseFeatures,
  IRecommendationEngine,
  IContext,
  IDemographics,
  INeeds,
} from "../interfaces";

describe("createEngineWithDefaults", () => {
  const exampleExercises: IExerciseData = [
    {
      ExerciseName: "Exercise 1",
      ExerciseId: "e1",
      Features: generateExerciseFeatures({}),
    },
    {
      ExerciseName: "Exercise 2",
      ExerciseId: "e2",
      Features: generateExerciseFeatures({}),
    },
    {
      ExerciseName: "Exercise 3",
      ExerciseId: "e3",
      Features: generateExerciseFeatures({}),
    },
  ];

  const exampleContext: IContext = {
    timestamp: Date.now(),
    latest_ema_timestamp: Date.now(),
    evening: 0,
    weekend: 0,
    happy: 0,
    sad: 0,
    energetic: 0,
    relaxed: 0,
    stressed: 0,
    fatigued: 0,
    frustrated: 0,
    positive: 0,
    negative: 0,
  };

  it("should create a recommendation engine with default settings", () => {
    const engine: IRecommendationEngine =
      createEngineWithDefaults(exampleExercises);

    // Check if the engine is an instance of IRecommendationEngine
    expect(engine).toBeInstanceOf(Object);
    expect(engine).toHaveProperty("makeRecommendation");

    // Check if the engine can make a recommendation
    const recommendation = engine.makeRecommendation(exampleContext);
    expect(recommendation).toBeInstanceOf(Object);
    expect(recommendation).toHaveProperty("context");
    expect(recommendation).toHaveProperty("recommendedExercises");
    expect(recommendation.recommendedExercises).toBeInstanceOf(Array);
    expect(recommendation.recommendedExercises.length).toEqual(3);
    expect(recommendation.recommendedExercises[0]).toBeInstanceOf(Object);
    expect(recommendation.recommendedExercises[0]).toHaveProperty("exerciseId");
    expect(recommendation.recommendedExercises[0]).toHaveProperty("score");
    expect(recommendation.recommendedExercises[0]).toHaveProperty(
      "probability"
    );
  });
});

describe("createEngineForDemographicsAndNeeds", () => {
  const exampleExercises: IExerciseData = [
    {
      ExerciseName: "Exercise 1",
      ExerciseId: "e1",
      Features: generateExerciseFeatures({}),
    },
    {
      ExerciseName: "Exercise 2",
      ExerciseId: "e2",
      Features: generateExerciseFeatures({}),
    },
    {
      ExerciseName: "Exercise 3",
      ExerciseId: "e3",
      Features: generateExerciseFeatures({}),
    },
  ];

  const exampleDemographics: IDemographics = {
    male: 1,
    master: 1,
    international: 1,
  };

  const exampleNeeds: INeeds = {
    beMorePresent: 1,
    relax: 1,
    beKinderToMyself: 1,
    increasePositiveFeelings: 1,
    managedifficultThoughtsAndFeelings: 1,
    focusOnWhatMattersToMe: 1,
  };

  const exampleContext: IContext = {
    timestamp: Date.now(),
    latest_ema_timestamp: Date.now(),
    evening: 0,
    weekend: 0,
    happy: 0,
    sad: 0,
    energetic: 0,
    relaxed: 0,
    stressed: 0,
    fatigued: 0,
    frustrated: 0,
    positive: 0,
    negative: 0,
  };

  it("should create a recommendation engine with demographic and needs-based settings", () => {
    const engine: IRecommendationEngine = createEngineForDemographicsAndNeeds(
      exampleExercises,
      exampleDemographics,
      exampleNeeds
    );

    // Check if the engine is an instance of IRecommendationEngine
    expect(engine).toBeInstanceOf(Object);
    expect(engine).toHaveProperty("makeRecommendation");

    // Check if the engine can make a recommendation
    const recommendation = engine.makeRecommendation(exampleContext);
    expect(recommendation).toBeInstanceOf(Object);
    expect(recommendation).toHaveProperty("context");
    expect(recommendation).toHaveProperty("recommendedExercises");
    expect(recommendation.recommendedExercises).toBeInstanceOf(Array);
    expect(recommendation.recommendedExercises.length).toEqual(3);
    expect(recommendation.recommendedExercises[0]).toBeInstanceOf(Object);
    expect(recommendation.recommendedExercises[0]).toHaveProperty("exerciseId");
    expect(recommendation.recommendedExercises[0]).toHaveProperty("score");
    expect(recommendation.recommendedExercises[0]).toHaveProperty(
      "probability"
    );
  });
});

describe('createEngineFromJSON', () => {
    const exampleExercises: IExerciseData = [
        {
          ExerciseName: "Exercise 1",
          ExerciseId: "e1",
          Features: generateExerciseFeatures({}),
        },
        {
          ExerciseName: "Exercise 2",
          ExerciseId: "e2",
          Features: generateExerciseFeatures({}),
        },
        {
          ExerciseName: "Exercise 3",
          ExerciseId: "e3",
          Features: generateExerciseFeatures({}),
        },
      ];
    
      const exampleContext: IContext = {
        timestamp: Date.now(),
        latest_ema_timestamp: Date.now(),
        evening: 0,
        weekend: 0,
        happy: 0,
        sad: 0,
        energetic: 0,
        relaxed: 0,
        stressed: 0,
        fatigued: 0,
        frustrated: 0,
        positive: 0,
        negative: 0,
      };

      const originalEngine: IRecommendationEngine =
          createEngineWithDefaults(exampleExercises);
    
      const jsonPayload = originalEngine.toJSON();
    
      it("should create a recommendation engine with default settings", () => {
        const engine = createEngineFromJSON(jsonPayload, exampleExercises);
    
        // Check if the engine is an instance of IRecommendationEngine
        expect(engine).toBeInstanceOf(Object);
        expect(engine).toHaveProperty("makeRecommendation");
    
        // Check if the engine can make a recommendation
        const recommendation = engine.makeRecommendation(exampleContext);
        expect(recommendation).toBeInstanceOf(Object);
        expect(recommendation).toHaveProperty("context");
        expect(recommendation).toHaveProperty("recommendedExercises");
        expect(recommendation.recommendedExercises).toBeInstanceOf(Array);
        expect(recommendation.recommendedExercises.length).toEqual(3);
        expect(recommendation.recommendedExercises[0]).toBeInstanceOf(Object);
        expect(recommendation.recommendedExercises[0]).toHaveProperty("exerciseId");
        expect(recommendation.recommendedExercises[0]).toHaveProperty("score");
        expect(recommendation.recommendedExercises[0]).toHaveProperty(
          "probability"
        );
      });

});