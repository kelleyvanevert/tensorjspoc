import { useState } from "react";
import { AppButton } from "./AppButton";
import {
  Mood,
  Moods,
  IContext,
  generateContext,
} from "../recommender/interfaces";

type Props = {
  callback: (context: IContext) => void;
};

export function ContextComponent({ callback }: Props) {
  const [moodValues] = useState<Mood[]>(Moods);
  const [currentMood, setCurrentMood] = useState<Mood>(moodValues[0]);

  const onMoodPress = (mood: Mood) => {
    setCurrentMood(mood);
    callback(generateContext(mood));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {moodValues.map((mood: Mood) => (
          <AppButton
            title={mood.name}
            key={mood.value}
            onClick={() => onMoodPress(mood)}
          />
        ))}
      </div>
      <div className="mt-2 text-lg">Mood: {currentMood.name}</div>
    </div>
  );
}
