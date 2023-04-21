import {
    createDefaultExerciseFeatures,
    generateExerciseFeatures,
    IExerciseFeatures,
    YesNo,
  } from "../interfaces";

describe("createDefaultExerciseFeatures()", () => {
    it("should create an object with all features set to No", () => {
      const defaultFeatures: IExerciseFeatures = {
        short: YesNo.No,
        medium: YesNo.No,
        long: YesNo.No,
        mindfulness: YesNo.No,
        be_more_present: YesNo.No,
        relax: YesNo.No,
        be_kinder_to_myself: YesNo.No,
        increase_positive_feelings: YesNo.No,
        manage_difficult_thoughts_and_feelings: YesNo.No,
        focus_on_what_matters_to_me: YesNo.No,
        visualisation: YesNo.No,
        savouring: YesNo.No,
        breathing: YesNo.No,
        reframing: YesNo.No,
        defusing: YesNo.No,
        grounding: YesNo.No,
        audio_guided_exercise: YesNo.No,
        audio_only: YesNo.No,
        involves_body: YesNo.No,
        notebook_exercise: YesNo.No,
        outdoors: YesNo.No,
        private_location: YesNo.No,
        in_the_room_already: YesNo.No,
        times_completed: 0,
      };
      expect(createDefaultExerciseFeatures()).toEqual(defaultFeatures);
    });
  });
  
  describe("generateExerciseFeatures()", () => {
    it("should generate an IExerciseFeatures object with the specified features", () => {
      const features = {
        short: 1,
        medium: 1,
        long: 0,
        breathing: 1,
        times_completed: 3,
      };
      const expected: IExerciseFeatures = {
        short: YesNo.Yes,
        medium: YesNo.Yes,
        long: YesNo.No,
        mindfulness: YesNo.No,
        be_more_present: YesNo.No,
        relax: YesNo.No,
        be_kinder_to_myself: YesNo.No,
        increase_positive_feelings: YesNo.No,
        manage_difficult_thoughts_and_feelings: YesNo.No,
        focus_on_what_matters_to_me: YesNo.No,
        visualisation: YesNo.No,
        savouring: YesNo.No,
        breathing: YesNo.Yes,
        reframing: YesNo.No,
        defusing: YesNo.No,
        grounding: YesNo.No,
        audio_guided_exercise: YesNo.No,
        audio_only: YesNo.No,
        involves_body: YesNo.No,
        notebook_exercise: YesNo.No,
        outdoors: YesNo.No,
        private_location: YesNo.No,
        in_the_room_already: YesNo.No,
        times_completed: 3,
      };
      expect(generateExerciseFeatures(features)).toEqual(expected);
    });
  
    it("should warn if an invalid feature is provided", () => {
      const features = {
        invalid_feature: 1,
      };
      const warnSpy = jest.spyOn(console, "warn");
      const exerciseFeatures = generateExerciseFeatures(features);
      expect(warnSpy).toHaveBeenCalledWith(
        "Feature invalid_feature not found in exercise features"
      );
    });
  });