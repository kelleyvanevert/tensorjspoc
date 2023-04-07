import cx from "classnames";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function Switch({ value, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative block h-[32px] w-[70px] border bg-gray-300 border-black rounded-full"
    >
      <div
        className={cx(
          "bg-gray-500 absolute top-[3px] left-[3px] h-[24px] w-[24px] rounded-full transition-transform"
        )}
        style={{
          transform: `translate(${value ? 39 : 0}px, 0px)`,
        }}
      />
      <div className="absolute inset-0 leading-[28px] font-bold">{value ? "ON" : "off"}</div>
    </button>
  );
}
