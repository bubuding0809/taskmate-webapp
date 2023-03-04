import React, { useEffect, useState, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";
import { Save } from "@mui/icons-material";
import {
  Typography,
  Paper,
  styled,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { PanelMenu } from "@/components/Board/PanelMenu";
import { TodoList } from "@/components/Board/TodoList";
import { TodoPanelDivider } from "@/components/Board/TodoPanelDivider";

import useUpdatePanelTitle from "@/utils/mutations/panel/useUpdatePanelTitle";
import type { PanelWithTasks } from "server/api/routers/board";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";

interface TodoListProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  panelItem: PanelWithTasks;
  isItemCombineEnabled: boolean;
}

const StyledTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#35605A",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#35605A",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#35605A",
    },
    "&:hover fieldset": {
      borderColor: "#35605A",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#35605A",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "18px",
    fontWeight: "600",
  },
});

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
      <div
        {...provided.dragHandleProps}
        className="flex items-center justify-between rounded-t pl-3 pr-2 pt-2"
      >
        {!isEditPanelTitle ? (
          <Tooltip title="Double-click to edit" placement="top-start">
            <Typography
              className="cursor-custom-cursor"
              variant="body2"
              fontWeight={600}
              fontSize={18}
              onDoubleClick={() => setIsEditPanelTitle(true)}
            >
              {panelItem.panel_title ?? "Untitled"}
            </Typography>
          </Tooltip>
        ) : (
          <form
            className={`animate__animated w-full ${
              isAnimateError ? "animate__headShake" : ""
            }`}
            onSubmit={handleSavePanelTitle}
          >
            <StyledTextField
              autoFocus
              variant="standard"
              type="text"
              fullWidth
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSavePanelTitle}>
                      <Save
                        sx={{
                          fontSize: "20px",
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        )}
        <PanelMenu panelItem={panelItem} />
      </div>

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

        {/* Divider */}
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
          isReveal={isReveal}
          handleReveal={() =>
            setIsReveal((prevState) => {
              return !prevState;
            })
          }
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
