import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export function Section({ children }: Props) {
  return (
    <div className="p-4 border-t-2 first:border-t-0 border-gray-300">
      {children}
    </div>
  );
}
