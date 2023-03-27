/* DONE BY: Ding RuoQian 2100971 */

import { classNames } from "@/utils/helper";
import React from "react";

interface DividerProps {
  thickness?: 0 | 2 | 4 | 8;
}

const Divider: React.FC<DividerProps> = ({ thickness }) => {
  const getBorderStyle = () => {
    return thickness ? `border-t-${thickness}` : "border-t";
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div
          className={classNames(getBorderStyle(), "w-full border-gray-300")}
        />
      </div>
    </div>
  );
};

export default Divider;
