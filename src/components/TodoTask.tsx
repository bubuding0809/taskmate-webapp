import React, { useRef, useState, useEffect } from "react";
import { BoardType, PanelType, TaskType } from "../utils/types";
import { Chip, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import autoAnimate from "@formkit/auto-animate";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { TodoTaskMenu } from "./TodoTaskMenu";
import { BpCheckBox } from "./custom/BpCheckBox";

interface TodoTaskProps {
  task: TaskType;
  panelData: PanelType;
  boardData: BoardType;
  provided: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  handleToggle: (taskId: string, panelId: string) => void;
  handleDelete: (taskId: string, panelId: string) => void;
  handleUnappendSubtask: (taskId: string, panelId: string) => void;
  handleRemoveDateTime: (taskId: string, panelId: string) => void;
}

export const TodoTask: React.FC<TodoTaskProps> = ({
  task,
  panelData,
  boardData,
  snapshot,
  handleToggle,
  handleDelete,
  handleRemoveDateTime,
  handleUnappendSubtask,
}) => {
  // Set up autoAnimation of ul element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const [isHover, setIsHover] = useState<boolean>(false);

  const formateDate = (date: string): string => {
    const dateObj = new Date(date);

    if (dateObj.toDateString() === new Date().toDateString()) {
      return "Today";
    }

    const dayOfWeekName = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const monthName = dateObj.toLocaleDateString("en-US", {
      month: "short",
    });
    const day = dateObj.getDate();

    return `${dayOfWeekName}, ${day} ${monthName}`;
  };

  const draggedStyle = (): string => {
    return snapshot?.isDragging
      ? "rounded border-3 border-slate-700 bg-slate-50/80 shadow-solid-small"
      : "";
  };

  return (
    <div
      className={`
      relative flex items-center justify-between 
      px-1 py-1 
      ${draggedStyle()}
    `}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* todo item content */}
      <div className="mr-4 flex w-full flex-col items-stretch">
        {/* CheckBox and task title */}
        <div className="flex items-start justify-start gap-1">
          <BpCheckBox
            className="self-start"
            name={task.id}
            checked={task.isCompleted}
            onChange={() => handleToggle(task.id, panelData.id)}
          />
          <Typography
            sx={{
              textDecoration: task.isCompleted ? "line-through" : "",
              width: "100%",
            }}
          >
            {task.title}
          </Typography>
          {isHover && (
            <div className="absolute -right-0.5 top-0">
              <TodoTaskMenu
                task={task}
                panelData={panelData}
                boardData={boardData}
                handleDelete={handleDelete}
                handleUnappend={handleUnappendSubtask}
              />
            </div>
          )}
        </div>

        {/* Task details: description, time, etc... */}
        <div ref={parent} className="ml-6 flex flex-col items-start gap-1">
          {task.description && (
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
                {task.description}
              </Typography>
              {/* Show delete button on hover */}
            </div>
          )}
          {task.date && (
            <Chip
              sx={{
                color: "text.secondary",
                paddingLeft: "5px",
              }}
              variant="outlined"
              size="small"
              label={`${formateDate(task.date)}, ${task.time && task.time}`}
              icon={<CalendarMonthIcon />}
              onDelete={
                task.isCompleted
                  ? undefined
                  : () => handleRemoveDateTime(task.id, panelData.id)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
