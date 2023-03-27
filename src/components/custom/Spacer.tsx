/* DONE BY: Ding RuoQian 2100971 */

import { classNames } from "@/utils/helper";
import React from "react";

interface SpacerProps {
  height?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 14
    | 16
    | 20
    | 24
    | 28
    | 32
    | 36
    | 40
    | 44
    | 48
    | 52
    | 56
    | 60
    | 64
    | 72
    | 80
    | 96;
}

const Spacer: React.FC<SpacerProps> = ({ height = 2 }) => {
  const getSpacerStyle = () => {
    return `p-${height}`;
  };
  return <div className={classNames(getSpacerStyle())} />;
};

export default Spacer;
