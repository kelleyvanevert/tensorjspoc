type Props = {
  step?: number;
  value: number;
  minimumValue: number;
  maximumValue: number;
  onChange: (value: number) => void;
};

export function Slider({
  step,
  value,
  minimumValue,
  maximumValue,
  onChange,
}: Props) {
  return (
    <input
      className="w-[200px]"
      type="range"
      step={step}
      min={minimumValue}
      max={maximumValue}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
