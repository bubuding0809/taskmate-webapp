/* DONE BY: Ding RuoQian 2100971 */

import React, { FormEventHandler, useEffect, useState } from "react";
import { TodoMain } from "./TodoMain";
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";

import type { PanelWithTasks } from "server/api/routers/board";
import { classNames } from "@/utils/helper";

interface PanelProps {
  style: DraggingStyle | NotDraggingStyle | undefined;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  panelItem: PanelWithTasks;
  isItemCombineEnabled: boolean;
}

const Panel = ({
  style,
  provided,
  snapshot,
  panelItem,
  isItemCombineEnabled,
}: PanelProps): JSX.Element => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={classNames("flex w-80 min-w-sm max-w-sm flex-col gap-2")}
      style={style}
    >
      {/* Task list */}
      <TodoMain
        provided={provided}
        snapshot={snapshot}
        panelItem={panelItem}
        isItemCombineEnabled={isItemCombineEnabled}
      />
    </div>
  );
};

export default Panel;
