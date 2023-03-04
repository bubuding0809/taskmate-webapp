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
import { TaskDetailed } from "server/api/routers/board";

interface TodoItemProps {
  taskListType: "active" | "completed";
  task: TaskDetailed | TaskWithSubtasks;
  panelItem: PanelWithTasks;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  style: DraggingStyle | NotDraggingStyle | undefined;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  taskListType,
  task,
  panelItem,
  provided,
  snapshot,
  style,
}: TodoItemProps) => {
  const [isRevealSubtasks, setIsRevealSubtasks] = useState(false);

  const parent = useRef(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent, isRevealSubtasks]);

  // Style that will be applied to the subtask list
  // const nestListPreviewStyle = () => {
  //   if (panelData.active.includes(task.id)) {
  //     return "bg-gradient-to-br from-emerald-100/50 to-gray-100";
  //   }
  //   return "bg-gradient-to-br from-gray-100/50 to-slate-200/50";
  // };

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
      className={`
        flex flex-col rounded p-1 shadow hover:shadow-inner
        ${task.is_completed ? "bg-gray-300" : "bg-white"}
        ${
          snapshot.isDragging
            ? "border-3 border-slate-700 bg-slate-50/80 shadow-solid-small"
            : "border"
        }
      `}
      style={style}
    >
      {/* Render parent task here */}
      <TodoTask
        task={task}
        panelItem={panelItem}
        provided={provided}
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
            onClick={() => setIsRevealSubtasks((prevState) => !prevState)}
          >
            {isRevealSubtasks ? (
              <ExpandMoreIcon sx={{ fontSize: "20px" }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: "20px" }} />
            )}
          </IconButton>

          {isRevealSubtasks ? (
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
