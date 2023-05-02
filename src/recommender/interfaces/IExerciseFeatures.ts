import { YesNo } from "./YesNo";

export interface IExerciseFeatures {
    short: YesNo;
    medium: YesNo;
    long: YesNo;
    mindfulness: YesNo;
    be_more_present: YesNo;
    relax: YesNo;
    be_kinder_to_myself: YesNo;
    increase_positive_feelings: YesNo;
    manage_difficult_thoughts_and_feelings: YesNo;
    focus_on_what_matters_to_me: YesNo;
    visualisation: YesNo;
    savouring: YesNo;
    breathing: YesNo;
    reframing: YesNo;
    defusing: YesNo;
    grounding: YesNo;
    audio_guided_exercise: YesNo;
    audio_only: YesNo;
    involves_body: YesNo;
    notebook_exercise: YesNo;
    outdoors: YesNo;
    private_location: YesNo;
    // dynamic features:
    in_the_room_already: YesNo;
    times_completed: number;
    [key: string]: YesNo | number;
}



export function createDefaultExerciseFeatures(): IExerciseFeatures {
    return {
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
}

export function generateExerciseFeatures(features: Record<string, number>): IExerciseFeatures {
    const exerciseFeatures = createDefaultExerciseFeatures();
    for (const key in exerciseFeatures) {
        if (features.hasOwnProperty(key)) {
            const value = features[key];
            exerciseFeatures[key] = value;
        }
    }
    for (const key in features) {
        if (!exerciseFeatures.hasOwnProperty(key)) {
            console.warn(`Feature ${key} not found in exercise features`);
        }
    }
    return exerciseFeatures;
}