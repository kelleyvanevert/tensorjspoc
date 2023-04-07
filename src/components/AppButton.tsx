import cx from "classnames";

type Props = {
  title: string;
  onClick?: () => void;
  className?: string;
};

export function AppButton({ title, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "block bg-green py-1 px-3 rounded-full font-display font-bold text-deepblue text-center transition-transform active:scale-[0.9]",
        className
      )}
    >
      {title}
    </button>
  );
}
