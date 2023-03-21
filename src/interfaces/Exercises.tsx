import { IExcercise } from "./IExcercise";
import { YesNo } from "./YesNo";

export const Exercises: IExcercise[] = [
    {
        DisplayName: 'Article ACT',
        InternalName: 'articles_act',
        Features: {
            three_five_mins: YesNo.No,
            five_seven_mins: YesNo.Yes,
            seven_ten_mins: YesNo.No,
            deffuse: YesNo.No,
            zoom_out: YesNo.No,
            feeling_stressed: YesNo.No,
            feeling_angry: YesNo.No,
            mood_boost: YesNo.No,
            self_compassion: YesNo.No
        },
    },
    {
        InternalName: 'shape_your_thoughts',
        DisplayName: 'Shape Your Thoughts',
        Features: {
            three_five_mins: YesNo.No,
            five_seven_mins: YesNo.No,
            seven_ten_mins: YesNo.Yes,
            deffuse: YesNo.Yes,
            zoom_out: YesNo.No,
            feeling_stressed: YesNo.No,
            feeling_angry: YesNo.No,
            mood_boost: YesNo.No,
            self_compassion: YesNo.No
        },
    },
    {
        InternalName: 'self_compassion_break',
        DisplayName: 'Self Compassion Break',
        Features: {
            'three_five_mins': YesNo.Yes,
            'five_seven_mins': YesNo.No,
            'seven_ten_mins': YesNo.No,
            'deffuse': YesNo.No,
            'zoom_out': YesNo.No,
            'feeling_stressed': YesNo.No,
            'feeling_angry': YesNo.No,
            'mood_boost': YesNo.No,
            'self_compassion': YesNo.Yes
        },
    },
    {
        InternalName: 'body_scan',
        DisplayName: 'Body Scan',
        Features: {
            'three_five_mins': YesNo.No,
            'five_seven_mins': YesNo.No,
            'seven_ten_mins': YesNo.Yes,
            'deffuse': YesNo.No,
            'zoom_out': YesNo.No,
            'feeling_stressed': YesNo.No,
            'feeling_angry': YesNo.No,
            'mood_boost': YesNo.No,
            'self_compassion': YesNo.No
        },
    },
    {
        InternalName: 'article_mindfulness',
        DisplayName: 'Article Mindfulness',
        Features: {
            'three_five_mins': YesNo.Yes,
            'five_seven_mins': YesNo.No,
            'seven_ten_mins': YesNo.No,
            'deffuse': YesNo.No,
            'zoom_out': YesNo.No,
            'feeling_stressed': YesNo.No,
            'feeling_angry': YesNo.No,
            'mood_boost': YesNo.No,
            'self_compassion': YesNo.No
        },
    },
    {
        InternalName: 'progressive_muscle_relaxation',
        DisplayName: 'Progressive Muscle Relaxation',
        Features: {
            'three_five_mins': YesNo.No,
            'five_seven_mins': YesNo.No,
            'seven_ten_mins': YesNo.Yes,
            'deffuse': YesNo.No,
            'zoom_out': YesNo.No,
            'feeling_stressed': YesNo.Yes,
            'feeling_angry': YesNo.No,
            'mood_boost': YesNo.No,
            'self_compassion': YesNo.No
        },
    },
    {
        InternalName: 'article_breathing_relaxation',
        DisplayName: 'Article Breathing Relaxation',
        Features: {
            'three_five_mins': YesNo.Yes,
            'five_seven_mins': YesNo.No,
            'seven_ten_mins': YesNo.No,
            'deffuse': YesNo.No,
            'zoom_out': YesNo.No,
            'feeling_stressed': YesNo.Yes,
            'feeling_angry': YesNo.Yes,
            'mood_boost': YesNo.Yes,
            'self_compassion': YesNo.No
        },
    },
    {
        InternalName: 'compassionate_friend',
        DisplayName: 'Compassionate Friend',
        Features: {
            'three_five_mins': YesNo.No,
            'five_seven_mins': YesNo.No,
            'seven_ten_mins': YesNo.Yes,
            'deffuse': YesNo.No,
            'zoom_out': YesNo.No,
            'feeling_stressed': YesNo.No,
            'feeling_angry': YesNo.No,
            'mood_boost': YesNo.No,
            'self_compassion': YesNo.Yes
        },
    }
]

// exerciseNames is a list of all the exercise DisplayNames:
export const exerciseNames = Exercises.map((exercise) => exercise.InternalName);