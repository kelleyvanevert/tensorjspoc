import { YesNo } from "./YesNo";

export interface IExcerciseFeatures {
    three_five_mins: YesNo;
    five_seven_mins: YesNo;
    seven_ten_mins: YesNo;
    defuse: YesNo;
    zoom_out: YesNo;
    feeling_stressed: YesNo;
    feeling_angry: YesNo;
    mood_boost: YesNo;
    self_compassion: YesNo;
    relax: YesNo;
    energize: YesNo;
    feeling_anxious: YesNo;
    grounding: YesNo;
    feeling_blue: YesNo;
    focus: YesNo;
    shift_perspective: YesNo;
    introspect: YesNo;
    breathing: YesNo;
    article: YesNo;
    [key: string]: number;
}