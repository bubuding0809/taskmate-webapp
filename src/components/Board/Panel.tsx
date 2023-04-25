/* DONE BY: Ding RuoQian 2100971 */

import React, { useEffect, useRef, useState } from "react";
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import autoAnimate from "@formkit/auto-animate";
import { Paper, Divider } from "@mui/material";
import { PanelHeader } from "@/components/board/PanelHeader";
import { TaskList } from "@/components/board/TaskList";

import type { PanelWithTasks } from "server/api/routers/board";

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
  // Set up autoAnimation of ul element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // state to control whether completed tasks are revealed
  const [isReveal, setIsReveal] = useState<boolean>(false);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="flex w-80 min-w-sm max-w-sm flex-col gap-2"
      style={style}
    >
      <Paper
        sx={{
          backgroundColor: "rgba(220, 220, 220, 0.6)",
          border: snapshot.isDragging
            ? "3px solid rgba(51, 65, 85, 1)"
            : "1px solid rgba(175, 175, 175, 0.36)",
          boxShadow: snapshot.isDragging
            ? "3px 3px 0.5px #747e8c"
            : "0 4px 30px rgba(0, 0, 0, 0.1)",
          borderRadius: snapshot.isDragging ? "8px" : "4px",
        }}
        className="flex flex-col"
        elevation={3}
      >
        {/* Panel header */}
        <PanelHeader
          provided={provided}
          panelItem={panelItem}
          activeCount={
            panelItem.Task.filter(
              (task) => !task.parentTaskId && !task.is_completed
            ).length
          }
          completedCount={
            panelItem.Task.filter(
              (task) => task.is_completed && !task.parentTaskId
            ).length
          }
          isReveal={isReveal}
          setIsReveal={setIsReveal}
        />

        <Divider />

        {/* Panel body */}
        <div ref={parent} className="flex flex-col">
          {/* Render un-completed tasks */}

          {/* Render active tasks */}
          <TaskList
            taskListType="active"
            panelItem={panelItem}
            // Only render tasks that are not completed and is also a root task
            tasks={panelItem.Task.filter(
              (task) => !task.parentTaskId && !task.is_completed
            )}
            isItemCombineEnabled={isItemCombineEnabled}
          />

          {/* Render completed tasks */}
          {isReveal && (
            <TaskList
              taskListType="completed"
              panelItem={panelItem}
              tasks={panelItem.Task.filter(
                (task) => task.is_completed && !task.parentTaskId
              )}
              isItemCombineEnabled={false}
            />
          )}
        </div>
      </Paper>
    </div>
  );
};

export default Panel;
