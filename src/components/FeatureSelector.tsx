import cx from "classnames";

type Props = {
  features: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function FeatureSelector({ features, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {features.map((feature) => {
        const isSelected = value.includes(feature);

        return (
          <button
            key={feature}
            type="button"
            className={cx(
              "block rounded-full text-sm px-2",
              isSelected ? "bg-deepblue text-white" : "line-through"
            )}
            onClick={() => {
              if (isSelected) {
                onChange(value.filter((x) => x !== feature));
              } else {
                onChange([...value, feature]);
              }
            }}
          >
            {feature}
          </button>
        );
      })}
    </div>
  );
}
