import { IExercise } from "./IExercise";
import { generateExerciseFeatures } from "./IExerciseFeatures";
import { YesNo } from "./YesNo";

export const Exercises: IExercise[] = [
    {
        ExerciseId: 'shape_your_thoughts',
        ExerciseName: 'Shape Your Thoughts',
        Features: generateExerciseFeatures({
            long: YesNo.Yes,
            manage_difficult_thoughts_and_feelings: YesNo.Yes,
            visualisation: YesNo.Yes,
            defusing: YesNo.Yes,
            audio_guided_exercise: YesNo.Yes,
            notebook_exercise: YesNo.Yes,
            private_location: YesNo.Yes,
        })
    },
    // {
    //     ExerciseId: 'self_compassion_break',
    //     ExerciseName: 'Self Compassion Break',
    //     Features: generateExerciseFeatures({

    //     })
    // },
    {
        ExerciseId: 'body_scan',
        ExerciseName: 'Body Scan',
        Features: generateExerciseFeatures({
            long: YesNo.Yes,
            be_more_present: YesNo.Yes,
            grounding: YesNo.Yes,
            audio_guided_exercise: YesNo.Yes,
            audio_only: YesNo.Yes,
            private_location: YesNo.Yes,
        })
    },
    // {
    //     ExerciseId: 'progressive_muscle_relaxation',
    //     ExerciseName: 'Progressive Muscle Relaxation',
    //     Features: generateExerciseFeatures({
    //     })
    // },
    // {
    //     ExerciseId: 'compassionate_friend',
    //     ExerciseName: 'Compassionate Friend',
    //     Features: generateExerciseFeatures({

    //     })
    // },
    {
        ExerciseId: 'naming_thanking_mind',
        ExerciseName: 'Naming&Thanking mind',
        Features: generateExerciseFeatures({
            short: YesNo.Yes,
            manage_difficult_thoughts_and_feelings: YesNo.Yes,
            defusing: YesNo.Yes,
        })
    },
    {
        ExerciseId: '3_good_things',
        ExerciseName: '3 Good Things',
        Features: generateExerciseFeatures({
            short: YesNo.Yes,
            increase_positive_feelings: YesNo.Yes,
            savouring: YesNo.Yes,
            notebook_exercise: YesNo.Yes,
        })
    },
    // {
    //     ExerciseId: 'labeling',
    //     ExerciseName: 'Labeling',
    //     Features: generateExerciseFeatures({
    //     })
    // },
    // {
    //     ExerciseId: 'leaves_on_stream',
    //     ExerciseName: 'Leaves on a stream',
    //     Features: generateExerciseFeatures({
    //     })
    // },
    {
        ExerciseId: 'bad_news_radio',
        ExerciseName: 'Bad News Radio',
        Features: generateExerciseFeatures({
            short: YesNo.Yes,
            manage_difficult_thoughts_and_feelings: YesNo.Yes,
            defusing: YesNo.Yes,
            audio_guided_exercise: YesNo.Yes,
            private_location: YesNo.Yes,
        })
    },
    {
        ExerciseId: 'milk_milk_milk',
        ExerciseName: 'Milk Milk Milk',
        Features: generateExerciseFeatures({
            medium: YesNo.Yes,
            manage_difficult_thoughts_and_feelings: YesNo.Yes,
            defusing: YesNo.Yes,
            audio_guided_exercise: YesNo.Yes,
            private_location: YesNo.Yes,
        })
    },
    // {
    //     ExerciseId: 'five_senses',
    //     ExerciseName: 'Five Senses',
    //     Features: generateExerciseFeatures({

    //     })
    // },
    // {
    //     ExerciseId: 'tracking_thought_in_time',
    //     ExerciseName: 'Tracking thoughts in time',
    //     Features: generateExerciseFeatures({
    //     })
    // },
    {
        ExerciseId: 'alternate_nostril_breathing',
        ExerciseName: 'Alternate nostril breathing',
        Features: generateExerciseFeatures({
            medium: YesNo.Yes,
            relax: YesNo.Yes,
            breathing: YesNo.Yes,
        })
    },
    // {
    //     ExerciseId: 'boxed_breathing',
    //     ExerciseName: 'Boxed Breathing',
    //     Features: generateExerciseFeatures({

    //     })
    // },
    // {
    //     ExerciseId: 'diaphragmatic_breathing',
    //     ExerciseName: 'Diaphragmatic Breathing',
    //     Features: generateExerciseFeatures({

    //     })
    // },
    {
        ExerciseId: 'talking_to_friend',
        ExerciseName: 'Talking to a friend',
        Features: generateExerciseFeatures({
            short: YesNo.Yes,
            be_kinder_to_myself: YesNo.Yes,
        })
    },
    // {
    //     ExerciseId: 'savouring',
    //     ExerciseName: 'Savouring',
    //     Features: generateExerciseFeatures({
    //     })
    // },
    {
        ExerciseId: 'positive_self_talk',
        ExerciseName: 'Positive Self Talk',
        Features: generateExerciseFeatures({
            short: YesNo.Yes,
            be_kinder_to_myself: YesNo.Yes,
            increase_positive_feelings: YesNo.Yes,
            notebook_exercise: YesNo.Yes,
        })
    },
    {
        ExerciseId: 'follow_your_breath',
        ExerciseName: 'Follow Your Breath',
        Features: generateExerciseFeatures({
            medium: YesNo.Yes,
            be_more_present: YesNo.Yes,
            breathing: YesNo.Yes,
            grounding: YesNo.Yes,
            audio_guided_exercise: YesNo.Yes,
            audio_only: YesNo.Yes,
        })
    },
    
]

// exerciseIds is a list of all the exercise ExerciseNames:
export const exerciseIds = Exercises.map((exercise) => exercise.ExerciseId);