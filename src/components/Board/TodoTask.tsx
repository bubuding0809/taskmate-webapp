import React, { useRef, useState, useEffect } from "react";
import { Chip, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import autoAnimate from "@formkit/auto-animate";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { TodoTaskMenu } from "./TodoTaskMenu";
import { BpCheckBox } from "../custom/BpCheckBox";

import type { PanelWithTasks } from "server/api/routers/board";
import type { Task } from "@prisma/client";
import type { TaskDetailed } from "server/api/routers/board";
import { formatDate } from "@/utils/helper";
import { api } from "@/utils/api";
import useToggleTaskStatus from "@/utils/mutations/task/useToggleTaskStatus";

interface TodoTaskProps {
  task: TaskDetailed | Task;
  panelItem: PanelWithTasks;
  provided: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  handleRemoveDateTime: (taskId: string, panelId: string) => void;
}

// Style for dragged task
const draggedStyle = (snapshot: DraggableStateSnapshot | undefined): string => {
  return snapshot?.isDragging
    ? "rounded border-3 border-slate-700 bg-slate-50/80 shadow-solid-small"
    : "";
};

export const TodoTask: React.FC<TodoTaskProps> = ({
  task,
  panelItem,
  provided,
  snapshot,
  handleRemoveDateTime,
}) => {
  // Set up autoAnimation of ul element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // set up hover state to show task menu button on hover
  const [isHover, setIsHover] = useState<boolean>(false);

  // Mutation to toggle task completion
  const { mutate: toggleTask } = useToggleTaskStatus();

  const handleToggleTask = (toggledTask: typeof task) => {
    const { id, panel_id, is_completed, parentTaskId } = toggledTask;

    // Mutation to toggle task completion
    toggleTask({
      boardId: panelItem.board_id,
      panelId: panel_id,
      taskId: id,
      parentTaskId: parentTaskId,
      completed: !is_completed,
    });
  };

  return (
    <div
      className={`
      relative flex items-center justify-between 
      px-1 py-1 
      ${draggedStyle(snapshot)}
    `}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* todo item content */}
      <div className="mr-4 flex w-full flex-col items-stretch">
        {/* CheckBox and task title */}
        <div
          className="flex items-start justify-start gap-1"
          {...provided.dragHandleProps}
        >
          <BpCheckBox
            className="self-start"
            name={task.id}
            checked={task.is_completed}
            onChange={() => handleToggleTask(task)}
          />
          <Typography
            sx={{
              textDecoration: task.is_completed ? "line-through" : "",
              width: "100%",
            }}
          >
            {task.task_title}
          </Typography>
          {isHover && (
            <div className="absolute -right-0.5 top-0">
              <TodoTaskMenu task={task} panelItem={panelItem} />
            </div>
          )}
        </div>

        {/* Task details: description, time, etc... */}
        <div ref={parent} className="ml-6 flex flex-col items-start gap-1">
          {task.task_details && (
            <div className="flex gap-1">
              <DescriptionIcon
                sx={{
                  color: "#9cb380",
                  opacity: 0.8,
                  fontSize: "18px",
                }}
              />
              <Typography
                textAlign="left"
                variant="body2"
                color="textSecondary"
              >
                {task.task_details}
              </Typography>
              {/* Show delete button on hover */}
            </div>
          )}
          {task.end_datetime && (
            <Chip
              sx={{
                color: "text.secondary",
                paddingLeft: "5px",
              }}
              variant="outlined"
              size="small"
              label={formatDate(task.end_datetime)}
              icon={<CalendarMonthIcon />}
              onDelete={
                task.is_completed
                  ? undefined
                  : () => handleRemoveDateTime(task.id, panelItem.id)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
