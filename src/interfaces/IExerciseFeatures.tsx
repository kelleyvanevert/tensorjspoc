import { YesNo } from "./YesNo";

export interface IExcerciseFeatures {
    three_five_mins: YesNo;
    five_seven_mins: YesNo;
    seven_ten_mins: YesNo;
    diffuse: YesNo;
    zoom_out: YesNo;
    feeling_stressed: YesNo;
    feeling_angry: YesNo;
    mood_boost: YesNo;
    self_compassion: YesNo;
    [key: string]: number;
}