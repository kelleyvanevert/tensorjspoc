import { AppButton } from "./AppButton";
import { IExercise, IRecommendation } from "../recommender/interfaces";
import { Section } from "./Section";

type Props = {
  recommendation: IRecommendation;
  recommendedExercises: IExercise[];
  callback: (
    recommendation: IRecommendation,
    exerciseId: string | undefined,
    rating: number | undefined
  ) => void;
};

export function RecommendedExercises({
  recommendation,
  recommendedExercises,
  callback,
}: Props) {
  return (
    <Section>
      <div className="text-lg font-bold mb-4">Your Recommendations:</div>
      <div className="flex flex-col gap-3">
        {recommendedExercises.map((ex) => {
          return (
            <div
              key={ex.ExerciseId}
              className="bg-white animate-appear-slide-up shadow p-2 flex items-center"
            >
              <div className="font-semibold w-1/2">{ex.ExerciseName}</div>
              <div className="grow" />
              {[1, 2, 3, 4, 5, undefined].map((rating) => {
                return (
                  <button
                    key={rating ?? "none"}
                    type="button"
                    className="block bg-gray-200 w-[32px] h-[32px] text-center ml-2 rounded-full font-semibold transition-transform active:scale-75"
                    onClick={() => {
                      callback(recommendation, ex.ExerciseId, rating);
                    }}
                  >
                    {rating ?? "X"}
                  </button>
                );
              })}
            </div>
          );
        })}

        <AppButton
          key={"none_of_the_above"}
          title="None of the above"
          onClick={() => {
            callback(recommendation, undefined, undefined);
          }}
        />
      </div>
    </Section>
  );
}
