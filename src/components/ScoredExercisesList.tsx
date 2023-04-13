import { IScoredExercise } from "../recommender/interfaces";

type Props = {
  scoredExercises: IScoredExercise[];
};

export function ScoredExercisesList({ scoredExercises }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {scoredExercises.map((item) => {
        return (
          <div
            key={item.ExerciseId}
            className="bg-white shadow p-2 flex items-center"
          >
            <div className="font-semibold w-1/2">{item.ExerciseName}</div>
            <div className="w-1/6 text-sm">
              Click: {Math.round((item.ClickScore || 0) * 100)}
            </div>
            <div className="w-1/6 text-sm">
              Liking: {Math.round((item.LikingScore || 0) * 50) / 10}
            </div>
            <div className="w-1/6 text-sm">
              Proba: {Math.round((item.Probability || 0) * 10000) / 100}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
