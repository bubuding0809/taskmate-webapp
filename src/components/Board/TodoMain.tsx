import React, { useEffect, useState, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";
import { Save } from "@mui/icons-material";
import { AntSwitch } from "../custom/AntSwitch";
import { Paper, IconButton, Tooltip } from "@mui/material";
import { PanelMenu } from "@/components/Board/PanelMenu";
import { TodoList } from "@/components/Board/TodoList";
import { TodoPanelDivider } from "@/components/Board/TodoPanelDivider";
import useUpdatePanelTitle from "@/utils/mutations/panel/useUpdatePanelTitle";
import { classNames } from "@/utils/helper";

import type { PanelWithTasks } from "server/api/routers/board";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import Divider from "../custom/Divider";

interface TodoListProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  panelItem: PanelWithTasks;
  isItemCombineEnabled: boolean;
}

export const TodoMain: React.FC<TodoListProps> = ({
  provided,
  snapshot,
  panelItem,
  isItemCombineEnabled,
}: TodoListProps) => {
  // Set up autoAnimation of ul element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // UI state to toggle panel title edit mode
  const [isEditPanelTitle, setIsEditPanelTitle] = useState(false);

  // UI state to control panel title input
  const [panelTitle, setPanelTitle] = useState<string>(
    panelItem.panel_title ?? "Untitled"
  );

  // state to control whether completed tasks are revealed
  const [isReveal, setIsReveal] = useState<boolean>(false);

  // state to control whether error animation is triggered when editing panel title
  const [isAnimateError, setIsAnimateError] = useState<boolean>(false);

  // Mutation to update panel title
  const { mutate: updatePanelTitle } = useUpdatePanelTitle();

  const handleSavePanelTitle = (e: React.FormEvent) => {
    e.preventDefault();

    // If panel title is empty, animate error
    if (!panelTitle.trim()) {
      setIsAnimateError(true);
      setTimeout(() => {
        setIsAnimateError(false);
      }, 1000);
      return;
    }

    // Mutation to update panel title
    updatePanelTitle({
      boardId: panelItem.board_id,
      panelId: panelItem.id,
      title: panelTitle,
    });

    // set panel edit state to false
    setIsEditPanelTitle(false);
  };

  return (
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
      className={`flex flex-col`}
      elevation={3}
    >
      {/* Panel header */}
      <div {...provided.dragHandleProps} className="flex flex-col rounded-t">
        <div className="flex items-center justify-between px-2 pt-2">
          {!isEditPanelTitle ? (
            // Panel title
            <Tooltip title="Double-click to edit" placement="top-start">
              <h3
                className="cursor-pointer truncate text-xl font-semibold text-gray-900"
                onDoubleClick={() => setIsEditPanelTitle(true)}
              >
                {panelItem.panel_title ?? "Untitled"}
              </h3>
            </Tooltip>
          ) : (
            // Panel title edit form
            <form
              className={`animate__animated w-full ${
                isAnimateError ? "animate__headShake" : ""
              }`}
              onSubmit={handleSavePanelTitle}
            >
              <div className="relative">
                <label
                  htmlFor="name"
                  className="inline-block bg-transparent px-1 text-xs font-medium text-gray-900"
                >
                  Panel title
                </label>
                <input
                  autoFocus
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full rounded-md border-0 py-1.5 pr-9 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xl sm:leading-6"
                  placeholder="Panel title"
                  value={panelTitle}
                  onChange={(e) => setPanelTitle(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyUp={(e) => {
                    if (e.key === "Escape") {
                      setIsEditPanelTitle(false);
                    }
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 27,
                    right: 5,
                  }}
                  size="small"
                  onClick={handleSavePanelTitle}
                >
                  <Save
                    sx={{
                      fontSize: "20px",
                    }}
                  />
                </IconButton>
              </div>
            </form>
          )}
          <div className="flex items-center">
            {/* Toggle for completed tasks */}
            <Tooltip title="Show completed tasks" placement="top-start">
              <div className="flex cursor-pointer items-center gap-1 rounded-full border bg-white px-2 py-1">
                <label
                  className={classNames(
                    isReveal ? "text-emerald-700" : "text-gray-500",
                    "text-xs font-medium"
                  )}
                >
                  Completed
                </label>
                <AntSwitch
                  onChange={() =>
                    setIsReveal((prevState) => {
                      return !prevState;
                    })
                  }
                  checked={isReveal}
                />
              </div>
            </Tooltip>
            <PanelMenu panelItem={panelItem} />
          </div>
        </div>

        {/* Panel divider */}
        <TodoPanelDivider
          // ! To be optimized
          activeCount={
            panelItem.Task.filter(
              (task) => !task.is_completed && !task.parentTaskId
            ).length
          }
          // ! To be optimized
          completedCount={
            panelItem.Task.filter(
              (task) => task.is_completed && !task.parentTaskId
            ).length
          }
          panelItem={panelItem}
        />
      </div>

      <Divider />

      {/* Panel body */}
      <div ref={parent} className="flex flex-col">
        {/* Render un-completed tasks */}

        {/* Render active tasks */}
        <TodoList
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
          <TodoList
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
  );
};
