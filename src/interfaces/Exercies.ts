import { IExcercise } from "./IExcercise";
import { Moods } from "./IMoodIndex";
import { YesNo } from "./YesNo";

export const Exercises: IExcercise[] = [
    {
        DisplayName: 'Article ACT',
        InternalName: 'articles_act',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'shape_your_thoughts',
        DisplayName: 'Shape Your Thoughts',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'self_compassion_break',
        DisplayName: 'Self Compassion Break',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'body_scan',
        DisplayName: 'Body Scan',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'article_mindfulness',
        DisplayName: 'Article Mindfulness',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'progressive_muscle_relaxation',
        DisplayName: 'Progressive Muscle Relaxation',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'article_breathing_relaxation',
        DisplayName: 'Article Breathing Relaxation',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    },
    {
        InternalName: 'compassionate_friend',
        DisplayName: 'Compassionate Friend',
        Value: {
            mood_value: Moods[0].value,
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
        Score: undefined
    }
]