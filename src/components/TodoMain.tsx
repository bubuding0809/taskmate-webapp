import { TaskType, BoardType, PanelType } from "../utils/types";
import React, { useEffect, useState, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { TodoPanelDivider } from "./TodoPanelDivider";
import { TodoList } from "./TodoList";
import { Save, MoreHoriz } from "@mui/icons-material";
import { PanelMenu } from "./PanelMenu";
import {
  Typography,
  Paper,
  styled,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";

interface TodoListProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  panelData: PanelType;
  boardData: BoardType;
  setBoardData: React.Dispatch<React.SetStateAction<BoardType>>;
  newPanel: string;
  setNewPanel: React.Dispatch<React.SetStateAction<string>>;
  isItemCombineEnabled: boolean;
  activeList: string[];
  completedList: string[];
  handleDeletePanel: (panelId: string) => void;
  handleDeleteTask: (taskId: string, panelId: string) => void;
  handleUnappendSubtask: (taskId: string, panelId: string) => void;
  handleToggleTask: (taskId: string, panelId: string) => void;
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
  panelData,
  boardData,
  setBoardData,
  activeList,
  completedList,
  newPanel,
  setNewPanel,
  isItemCombineEnabled,
  handleDeletePanel,
  handleDeleteTask,
  handleUnappendSubtask,
  handleToggleTask,
}: TodoListProps) => {
  // Set up autoAnimation of ul element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const [isEditPanelTitle, setIsEditPanelTitle] = useState(
    panelData.id === newPanel
  );
  const [panelTitle, setPanelTitle] = useState<string>(panelData.title);
  const [isReveal, setIsReveal] = useState<boolean>(false);
  const [isAnimateError, setIsAnimateError] = useState<boolean>(false);

  const handleSavePanelTitle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!panelTitle.trim()) {
      setIsAnimateError(true);
      setTimeout(() => {
        setIsAnimateError(false);
      }, 1000);
      return;
    }

    setBoardData(prevState => ({
      ...prevState,
      panels: {
        ...prevState.panels,
        [panelData.id]: {
          ...panelData,
          title: panelTitle,
        },
      },
    }));

    // set panel edit state to false
    setIsEditPanelTitle(false);

    // clear the new panel state
    setNewPanel("");
  };

  const handleReveal: React.ChangeEventHandler<HTMLInputElement> = () => {
    setIsReveal(prevState => {
      return !prevState;
    });
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
        className="flex items-center justify-between pl-3 pr-2 pt-2 rounded-t"
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
              {panelData.title}
            </Typography>
          </Tooltip>
        ) : (
          <form
            className={`w-full animate__animated ${
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
              onChange={e => setPanelTitle(e.target.value)}
              onFocus={e => e.target.select()}
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
        <PanelMenu
          panelData={panelData}
          boardData={boardData}
          handleDelete={handleDeletePanel}
        />
      </div>

      {/* Panel body */}
      <div ref={parent} className="flex flex-col">
        {/* Render un-completed tasks */}

        {/* Render active tasks */}
        <TodoList
          type="active"
          boardData={boardData}
          panelData={panelData}
          todoList={activeList}
          handleDeleteTask={handleDeleteTask}
          isItemCombineEnabled={isItemCombineEnabled}
          handleUnappendSubtask={handleUnappendSubtask}
          handleToggleTask={handleToggleTask}
        />

        {/* Divider */}
        <TodoPanelDivider
          activeCount={activeList.length}
          completedCount={completedList.length}
          isReveal={isReveal}
          handleReveal={handleReveal}
        />

        {/* Render completed tasks */}
        {isReveal && (
          <TodoList
            type="completed"
            boardData={boardData}
            panelData={panelData}
            todoList={completedList}
            isItemCombineEnabled={false}
            handleDeleteTask={handleDeleteTask}
            handleUnappendSubtask={handleUnappendSubtask}
            handleToggleTask={handleToggleTask}
          />
        )}
      </div>
    </Paper>
  );
};
