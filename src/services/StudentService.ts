import { Activity, Gender, Score, Student, TasteProfile, TimeOfDay, Weather } from "../interfaces"
import { normalize } from "./helper"

export class StudentService {
    age: number
    gender: number
    weather: number
    weak_knee: number
    time: number
    activity_feature_1: number
    activity_feature_2: number

    constructor(private ageInput: number, private genderInput: Gender, private weatherInput: Weather, private timeInput: TimeOfDay, private weakKneeInput: boolean, private activityInput: Activity) {
        this.age = normalize(this.ageInput, 16, 28);
        this.gender = this.normalizeGender(this.genderInput);
        this.weather = this.normalizeWeather(this.weatherInput);
        this.weak_knee = this.weakKneeInput ? 0 : 1;
        this.time = this.timeInput == TimeOfDay.Evening ? 0 : 1
        const activityFeature = this.getActivityFeatures(this.activityInput);
        this.activity_feature_1 = activityFeature.value1;
        this.activity_feature_2 = activityFeature.value2;
    }

    normalizeGender = (gender: Gender): number => {
        switch (gender) {
            case Gender.Female:
                return 0;
            case Gender.Male:
                return 0.5;
            case Gender.Other:
                return 1
            default:
                throw "Fatal error while normalizing gender.";
        }
    }

    normalizeWeather = (weather: Weather): number => {
        switch (weather) {
            case Weather.Sunny:
                return 0;
            case Weather.Cloudy:
                return 0.5;
            case Weather.Rainy:
                return 1;
            default:
                throw "Fatal error while normalizing weather"
        }
    }

    getActivityFeatures = (activity: Activity): { value1: number, value2: number } => {
        switch (activity) {
            case Activity.music:
                return {
                    value1: 1.0,
                    value2: 0.0
                }
            case Activity.meditation:
                return {
                    value1: 0.5,
                    value2: 0.0
                }
            case Activity.reading:
                return {
                    value1: 0.8,
                    value2: 0.0
                }
            case Activity.running:
                return {
                    value1: 0.9,
                    value2: 1.0
                }
            case Activity.yoga:
                return {
                    value1: 1.0,
                    value2: 0.9
                }
            case Activity.singing:
                return {
                    value1: 0.0,
                    value2: 1.0
                }
            case Activity.dancing:
                return {
                    value1: 0.0,
                    value2: 0.5
                }
            case Activity.walking:
                return {
                    value1: 0.0,
                    value2: 0.0
                }
            case Activity.cooking:
                return {
                    value1: 0.1,
                    value2: 0.1
                }
            case Activity.climbing:
                return {
                    value1: 0.05,
                    value2: 0.01
                }
            default:
                throw "Activity cannot have a default";
        }
    }

    createInput = (): Student => ({
        age: this.age,
        gender: this.gender,
        weather: this.weather,
        time: this.time,
        weak_knee: this.weak_knee,
        activity_feature_1: this.activity_feature_1,
        activity_feature_2: this.activity_feature_2
    })

    computeOutput = (taste: TasteProfile): Score => {
        let result = 1;

        switch (this.activityInput) {
            case Activity.music:
                if (this.timeInput == TimeOfDay.Morning || this.timeInput == TimeOfDay.Evening) {
                    result = 0;
                }
                break;
            case Activity.yoga:
                if (this.timeInput == TimeOfDay.Morning || this.timeInput == TimeOfDay.Evening) {
                    result = 0;
                }
                break;
            case Activity.running:
                if (this.genderInput == Gender.Male && taste == TasteProfile.Active) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 5;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 3;
                    }
                }
                else if (this.genderInput == Gender.Female && TasteProfile.Active) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 3;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 5;
                    }
                }
                break;
            case Activity.singing:
                if (this.genderInput == Gender.Male && TasteProfile.Active) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 3;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 5;
                    }
                }
                else if (this.genderInput == Gender.Female && TasteProfile.Active) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 5;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 3;
                    }
                }
                break;
            case Activity.meditation:
                if (this.genderInput == Gender.Male && taste == TasteProfile.Relaxed) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 5;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 3;
                    }
                }
                else if (this.genderInput == Gender.Female && taste == TasteProfile.Relaxed) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 3;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 5;
                    }
                }
                break;
            case Activity.reading:
                if (this.genderInput == Gender.Male && taste == TasteProfile.Relaxed) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 3;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 5;
                    }
                }
                else if (this.genderInput == Gender.Female && taste == TasteProfile.Relaxed) {
                    if (this.timeInput == TimeOfDay.Morning) {
                        result = 5;
                    }
                    else if (this.timeInput == TimeOfDay.Evening) {
                        result = 3;
                    }
                }
                break;
            default:
                result = 1;
        }

        return {
            value: result
        }
    }
}