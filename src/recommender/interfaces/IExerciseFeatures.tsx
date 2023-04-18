import { YesNo } from "./YesNo";



// export interface IExerciseFeatures {
//     three_five_mins: YesNo;
//     five_seven_mins: YesNo;
//     seven_ten_mins: YesNo;
//     defuse: YesNo;
//     zoom_out: YesNo;
//     feeling_stressed: YesNo;
//     feeling_angry: YesNo;
//     mood_boost: YesNo;
//     self_compassion: YesNo;
//     relax: YesNo;
//     energize: YesNo;
//     feeling_anxious: YesNo;
//     grounding: YesNo;
//     feeling_blue: YesNo;
//     focus: YesNo;
//     shift_perspective: YesNo;
//     introspect: YesNo;
//     breathing: YesNo;
//     article: YesNo;
//     ACT: YesNo;
//     Mindfulness: YesNo;
//     Relaxation: YesNo;
//     PositivePsychology: YesNo;
//     [key: string]: number;
// }

// short (≤5)
// Medium (6-10)
// Long (>10)
// Be more present
// Relax
// Be kinder to myself
// Increase positive feelings
// Manage difficult thoughts and feelings
// Focus on what matters to me
// Visualisation
// Savouring
// Breathing 
// Reframing
// Defusing
// Grounding
// Audio-guided exercise
// Audio only
// Notebook exercise
// Outdoors
// Private location
// In the Room

export interface IExerciseFeatures {
    short: YesNo;
    medium: YesNo;
    long: YesNo;
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
    notebook_exercise: YesNo;
    outdoors: YesNo;
    private_location: YesNo;
    in_the_room_already: YesNo;
    [key: string]: YesNo;
}



export function createDefaultExerciseFeatures(): IExerciseFeatures {
    return {
        short: YesNo.No,
        medium: YesNo.No,
        long: YesNo.No,
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
        notebook_exercise: YesNo.No,
        outdoors: YesNo.No,
        private_location: YesNo.No,
        in_the_room_already: YesNo.No,
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