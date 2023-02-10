import React, {
  CSSProperties,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { Entry, BoardType } from "../utils/types";
import { TodoEntryForm } from "./TodoEntryForm";
import { TodoMain } from "./TodoMain";
import { PanelType } from "../utils/types";
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";

interface PanelProps {
  style: DraggingStyle | NotDraggingStyle | undefined;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  panelData: PanelType;
  boardData: BoardType;
  setBoardData: React.Dispatch<React.SetStateAction<BoardType>>;
  newPanel: string;
  setNewPanel: React.Dispatch<React.SetStateAction<string>>;
  isItemCombineEnabled: boolean;
  handleDeletePanel: (panelId: string) => void;
  handleDeleteTask: (taskId: string, panelId: string) => void;
  handleUnappendSubtask: (taskId: string, panelId: string) => void;
  handleToggleTask: (taskId: string, panelId: string) => void;
}

const Panel = ({
  style,
  provided,
  snapshot,
  panelData,
  boardData,
  setBoardData,
  newPanel,
  setNewPanel,
  isItemCombineEnabled,
  handleDeletePanel,
  handleDeleteTask,
  handleUnappendSubtask,
  handleToggleTask,
}: PanelProps): JSX.Element => {
  const { active: activeList, completed: completedList } = panelData;

  const [newEntry, setNewEntry] = useState<Entry>({
    todoMessage: "",
    todoDateTime: null,
    todoDescription: "",
  });

  const [isAnimateEnter, setIsAnimateEnter] = useState(false);

  useEffect(() => {
    setIsAnimateEnter(true);

    const timeout = setTimeout(() => {
      setIsAnimateEnter(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  //handle new todo entry
  const handleNewEntry: FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    const { todoMessage, todoDateTime, todoDescription } = newEntry;

    // Ensure that the todoMessage is not empty
    if (!todoMessage.trim()) {
      alert("Enter a task mate");
      return;
    }

    // Update active list with new item
    const newTaskId = nanoid();
    setBoardData((prevState) => ({
      ...prevState,
      todoTasks: {
        ...prevState.todoTasks,
        [newTaskId]: {
          id: newTaskId,
          parent: null,
          title: todoMessage.trim(),
          date: todoDateTime ? todoDateTime.format("YYYY-MM-DD") : "",
          time: todoDateTime ? todoDateTime.format("h:mm a") : "",
          description: todoDescription ? todoDescription.trim() : "",
          subtasks: [],
          isCompleted: false,
        },
      },
      panels: {
        ...prevState.panels,
        [panelData.id]: {
          ...panelData,
          active: [newTaskId, ...panelData.active],
        },
      },
    }));

    //reset newEntry form
    setNewEntry({
      todoMessage: "",
      todoDateTime: null,
      todoDescription: "",
    });
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`animate__animated flex w-80 min-w-sm max-w-sm flex-col gap-2 ${
        isAnimateEnter ? "animate__bounceInDown animate__faster" : ""
      }`}
      style={style}
    >
      {/* Task Entry form */}
      <TodoEntryForm
        handleNewEntry={handleNewEntry}
        newEntry={newEntry}
        setNewEntry={setNewEntry}
      />

      {/* Task list */}
      <TodoMain
        provided={provided}
        snapshot={snapshot}
        panelData={panelData}
        boardData={boardData}
        setBoardData={setBoardData}
        activeList={activeList}
        completedList={completedList}
        newPanel={newPanel}
        isItemCombineEnabled={isItemCombineEnabled}
        setNewPanel={setNewPanel}
        handleDeletePanel={handleDeletePanel}
        handleDeleteTask={handleDeleteTask}
        handleUnappendSubtask={handleUnappendSubtask}
        handleToggleTask={handleToggleTask}
      />
    </div>
  );
};

export default Panel;
