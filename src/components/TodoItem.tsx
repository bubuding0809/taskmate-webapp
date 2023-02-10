import React, { useRef, useState, useEffect, CSSProperties } from "react";
import { Collapse, IconButton, Typography } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { BoardType, PanelType, TaskType } from "../utils/types";
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

interface TodoItemProps {
  task: TaskType;
  boardData: BoardType;
  panelData: PanelType;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  style: DraggingStyle | NotDraggingStyle | undefined;
  handleDeleteTask: (taskId: string, panelId: string) => void;
  handleUnappendSubtask: (taskId: string, panelId: string) => void;
  handleToggleTask: (taskId: string, panelId: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  boardData,
  panelData,
  provided,
  snapshot,
  style,
  handleDeleteTask,
  handleUnappendSubtask,
  handleToggleTask,
}: TodoItemProps) => {
  const [isRevealSubtasks, setIsRevealSubtasks] = useState(false);

  const parent = useRef(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent, isRevealSubtasks]);

  const nestListPreviewStyle = () => {
    if (panelData.active.includes(task.id)) {
      return "bg-gradient-to-br from-emerald-100/50 to-gray-100";
    }
    return "bg-gradient-to-br from-gray-100/50 to-slate-200/50";
  };

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
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`
        flex flex-col rounded p-1 shadow hover:shadow-inner
        ${task.isCompleted ? "bg-gray-300" : "bg-white"}
        ${
          snapshot.isDragging
            ? "border-3 border-slate-700 bg-slate-50/80 shadow-solid-small"
            : "border"
        }
      `}
      style={style}
    >
      <TodoTask
        task={task}
        panelData={panelData}
        boardData={boardData}
        provided={provided}
        handleToggle={handleToggleTask}
        handleDelete={handleDeleteTask}
        handleRemoveDateTime={() => console.log("yet to be implemented")}
        handleUnappendSubtask={handleUnappendSubtask}
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
            onClick={() => setIsRevealSubtasks((prevState) => !prevState)}
          >
            {isRevealSubtasks ? (
              <ExpandMoreIcon sx={{ fontSize: "20px" }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: "20px" }} />
            )}
          </IconButton>

          {isRevealSubtasks ? (
            <Droppable droppableId={task.id} type={"active-subtask"}>
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
                      <Collapse key={boardData.todoTasks[subtask]!.id}>
                        <Draggable
                          draggableId={boardData.todoTasks[subtask]!.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
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
                                task={boardData.todoTasks[subtask]!}
                                panelData={panelData}
                                boardData={boardData}
                                provided={provided}
                                snapshot={snapshot}
                                handleToggle={handleToggleTask}
                                handleDelete={handleDeleteTask}
                                handleRemoveDateTime={() =>
                                  console.log("yet to be implemented")
                                }
                                handleUnappendSubtask={handleUnappendSubtask}
                              />
                            </div>
                          )}
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
              className={`
                cursor-pointer rounded border
                ${nestListPreviewStyle()}
              `}
              variant="subtitle2"
              sx={{
                lineHeight: "20px",
                width: "100%",
                paddingX: "10px",
                paddingY: "2px",
              }}
              onClick={() => setIsRevealSubtasks(true)}
            >
              {`${task.subtasks.length} sub tasks`}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};
