/* DONE BY: Ding RuoQian 2100971 */

import React, { useRef, useState, useEffect, CSSProperties } from "react";
import { Collapse, IconButton, Typography } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { Divider } from "@mui/material";
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
  Droppable,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import { TodoTask } from "./TodoTask";
import autoAnimate from "@formkit/auto-animate";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PanelWithTasks, TaskWithSubtasks } from "server/api/routers/board";
import { classNames } from "@/utils/helper";
import useToggleRevealSubtasks from "@/utils/mutations/task/useToggleRevealSubtasks";

interface TodoItemProps {
  taskListType: "active" | "completed";
  task: TaskWithSubtasks;
  panelItem: PanelWithTasks;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  style?: DraggingStyle | NotDraggingStyle;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  taskListType,
  task,
  panelItem,
  provided,
  snapshot,
  style,
}: TodoItemProps) => {
  const parent = useRef(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent, task.is_reveal_subtasks]);

  const { mutate: toggelRevealSubtasks } = useToggleRevealSubtasks();

  const nestedListStyle = (snapshot: DroppableStateSnapshot) => {
    const { isDraggingOver, draggingFromThisWith, draggingOverWith } = snapshot;

    if (!isDraggingOver) {
      return "";
    }

    if (draggingFromThisWith === draggingOverWith)
      return "bg-emerald-100/50 shadow-inner rounded-r";
    else {
      return "bg-sky-100/50 shadow-inner rounded-r";
    }
  };

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className={classNames(
        task.is_completed ? "bg-gray-300" : "bg-white",
        snapshot?.isDragging
          ? "border-3 border-slate-700 bg-slate-50/80 shadow-solid-small"
          : "border",
        "flex flex-col rounded p-1 shadow hover:shadow-inner"
      )}
      style={style}
    >
      {/* Render parent task here */}
      <TodoTask
        task={task}
        panelItem={panelItem}
        provided={provided ?? undefined}
        handleRemoveDateTime={() => alert("yet to be implemented")}
      />

      {/* sub tasks */}
      {task.subtasks.length > 0 && (
        <div
          ref={parent}
          className="flex items-center justify-start gap-1 p-1.5"
        >
          <IconButton
            sx={{
              padding: "0",
              alignSelf: "flex-start",
            }}
            size="small"
            onClick={() =>
              toggelRevealSubtasks({
                boardId: panelItem.board_id,
                panelId: panelItem.id,
                taskId: task.id,
                parentTaskId: task.parentTaskId,
                reveal: !task.is_reveal_subtasks,
              })
            }
          >
            {task.is_reveal_subtasks ? (
              <ExpandMoreIcon sx={{ fontSize: "20px" }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: "20px" }} />
            )}
          </IconButton>

          {task.is_reveal_subtasks ? (
            <Droppable droppableId={`${task.id}-drop`} type={"active-subtask"}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-full border-l-2 px-1 ${nestedListStyle(
                    snapshot
                  )}`}
                >
                  <TransitionGroup className="flex flex-col">
                    {task.subtasks.map((subtask, index) => (
                      <Collapse key={subtask.id}>
                        <Draggable
                          draggableId={`${subtask.id}-subtask`}
                          index={index}
                          isDragDisabled={
                            subtask.is_completed && taskListType === "completed"
                          }
                        >
                          {(provided, snapshot) => {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                {!snapshot.isDragging && index !== 0 && (
                                  <Divider
                                    sx={{
                                      marginX: 1,
                                      marginY: 0.5,
                                    }}
                                  />
                                )}
                                <TodoTask
                                  task={subtask}
                                  panelItem={panelItem}
                                  provided={provided}
                                  snapshot={snapshot}
                                  handleRemoveDateTime={() =>
                                    console.log("yet to be implemented")
                                  }
                                />
                              </div>
                            );
                          }}
                        </Draggable>
                      </Collapse>
                    ))}
                  </TransitionGroup>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            <Typography
              className={classNames(
                // nestListPreviewStyle(),
                "cursor-pointer rounded border"
              )}
              variant="subtitle2"
              sx={{
                lineHeight: "20px",
                width: "100%",
                paddingX: "10px",
                paddingY: "2px",
              }}
              onClick={() => {
                toggelRevealSubtasks({
                  boardId: panelItem.board_id,
                  panelId: panelItem.id,
                  taskId: task.id,
                  parentTaskId: task.parentTaskId,
                  reveal: !task.is_reveal_subtasks,
                });
              }}
            >
              {`${task.subtasks.length} sub tasks`}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};
