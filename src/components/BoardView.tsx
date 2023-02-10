import { Button, Collapse } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BoardType } from "../utils/types";
import Panel from "./Panel";
import AddIcon from "@mui/icons-material/Add";
import { nanoid } from "nanoid";
import { getLocalStorage, setLocalStorage } from "../utils/useLocalStorage";
import {
  DragDropContext,
  Draggable,
  DragStart,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { TransitionGroup } from "react-transition-group";

const emptyBoardData: BoardType = {
  todoTasks: {},
  panels: {},
  panelOrder: [],
};

const BoardView = () => {
  const [boardData, setBoardData] = useState<BoardType>(emptyBoardData);
  const [newPanel, setNewPanel] = useState("");
  const [isItemCombineEnabled, setIsItemCombineEnabled] = useState(false);

  useEffect(() => {
    const localBoardData = getLocalStorage("boardData", emptyBoardData);
    setBoardData(localBoardData);
  }, []);

  useEffect(() => {
    setLocalStorage("boardData", boardData);
  }, [boardData]);

  const handleCreateNewPanel = () => {
    // Create new panel and update state
    const newPanelId = nanoid();
    setBoardData((prevState) => ({
      ...prevState,
      panels: {
        ...prevState.panels,
        [newPanelId]: {
          id: newPanelId,
          title: "Untitled",
          active: [],
          completed: [],
        },
      },
      panelOrder: [...prevState.panelOrder, newPanelId],
    }));

    setNewPanel(newPanelId);
  };

  const handleDeletePanel = (panelId: string) => {
    setBoardData((prevState) => {
      const newTodoTasks = { ...prevState.todoTasks };
      const newPanels = { ...prevState.panels };

      // Delete all tasks and subtasks in panel
      [...newPanels[panelId]!.active, ...newPanels[panelId]!.completed].forEach(
        (taskId: string) => {
          newTodoTasks[taskId]!.subtasks.forEach((subtaskId: string) => {
            delete newTodoTasks[subtaskId];
          });
          delete newTodoTasks[taskId];
        }
      );

      // remove panel from board
      delete newPanels[panelId];

      return {
        ...prevState,
        todoTasks: newTodoTasks,
        panels: newPanels,
        panelOrder: prevState.panelOrder.filter((id) => id !== panelId),
      };
    });
  };

  const handleDragStart = (initial: DragStart) => {
    const { draggableId, source, type } = initial;

    if (type === "panel-active") {
      if (boardData.todoTasks[draggableId]!.subtasks.length === 0) {
        setIsItemCombineEnabled(true);
      } else {
        setIsItemCombineEnabled(false);
      }
      return;
    }

    if (type === "panel-completed") {
      setIsItemCombineEnabled(false);
      return;
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source, type, combine } = result;

    // If it is a combine drag, add source draggable to destination draggable subtasks
    if (combine) {
      const newPanels = { ...boardData.panels };

      // splice out source draggable from source panel
      const key = source.droppableId.replace("-active", "");
      const [newSubtaskId] = newPanels[key]!.active.splice(source.index, 1) as [
        string
      ];

      setBoardData((prevState) => ({
        ...prevState,
        todoTasks: {
          ...prevState.todoTasks,
          [combine.draggableId]: {
            ...prevState.todoTasks[combine.draggableId]!,
            subtasks: [
              ...prevState.todoTasks[combine.draggableId]!.subtasks,
              newSubtaskId,
            ],
          },
          [newSubtaskId]: {
            ...prevState.todoTasks[newSubtaskId]!,
            parent: combine.draggableId,
          },
        },
      }));
    }

    // If draggable is dropped on a invlaid location, return
    if (!destination) {
      return;
    }

    // If draggable is dropped in the same location, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If draggable is from the board aka a panel, update the board state
    if (type === "board") {
      const newPanelOrder = [...boardData.panelOrder];
      newPanelOrder.splice(source.index, 1);
      newPanelOrder.splice(destination.index, 0, draggableId);

      setBoardData((prevState) => {
        const newPanelOrder = [...prevState.panelOrder];
        newPanelOrder.splice(source.index, 1);
        newPanelOrder.splice(destination.index, 0, draggableId);

        return {
          ...prevState,
          panelOrder: newPanelOrder,
        };
      });
      return;
    }

    // If draggable is from a panel, update the panel state
    if (type === "panel-active") {
      // create new panel state
      const newPanels = { ...boardData.panels };

      // splice the dragged item from the source panel task array
      newPanels[source.droppableId.replace("-active", "")]!.active.splice(
        source.index,
        1
      );

      // splice the dragged item into the destination panel task array
      newPanels[destination.droppableId.replace("-active", "")]!.active.splice(
        destination.index,
        0,
        draggableId
      );

      // update the board panels state
      setBoardData((prevState) => ({
        ...prevState,
        panels: newPanels,
      }));
      return;
    }

    // Handle drag drop of subtasks in active panels
    if (type === "active-subtask") {
      console.table(result);

      setBoardData((prevState) => {
        const newTodoTasks = { ...prevState.todoTasks };

        // Remove the subtask from the parent task
        newTodoTasks[source.droppableId]!.subtasks.splice(source.index, 1);

        // Add the subtask to the destination task
        newTodoTasks[destination.droppableId]!.subtasks.splice(
          destination.index,
          0,
          draggableId
        );

        // Update the subtask parent
        newTodoTasks[draggableId]!.parent = destination.droppableId;

        return {
          ...prevState,
          todoTasks: newTodoTasks,
        };
      });
    }
  };

  const taskProps = {
    handleDeleteTask: (taskId: string, panelId: string) => {
      const task = boardData.todoTasks[taskId]!;
      // If task has no parent, remove entire item from the panel
      if (!task.parent) {
        setBoardData((prevState) => {
          const taskIdsforDeletion = [...task.subtasks, task.id];
          const newTodoTasks = { ...prevState.todoTasks };
          const newActive = prevState.panels[panelId]!.active.filter(
            (id) => id !== taskId
          );
          const newCompleted = prevState.panels[panelId]!.completed.filter(
            (id) => id !== taskId
          );

          for (const taskId in newTodoTasks) {
            if (taskIdsforDeletion.includes(taskId)) {
              delete newTodoTasks[taskId];
            }
          }

          return {
            ...prevState,
            todoTasks: newTodoTasks,
            panels: {
              ...prevState.panels,
              [panelId]: {
                ...prevState.panels[panelId]!,
                active: newActive,
                completed: newCompleted,
              },
            },
          };
        });
      } else {
        setBoardData((prevState) => {
          const newTodoTasks = { ...prevState.todoTasks };
          delete newTodoTasks[taskId];

          return {
            ...prevState,
            todoTasks: {
              ...newTodoTasks,
              [task.parent!]: {
                ...prevState.todoTasks[task.parent!]!,
                subtasks: newTodoTasks[task.parent!]!.subtasks.filter(
                  (id) => id !== task.id
                ),
              },
            },
          };
        });
      }
    },
    handleUnappendSubtask: (taskId: string, panelId: string) => {
      const parentId = boardData.todoTasks[taskId]!.parent!;
      const newParentTask = { ...boardData.todoTasks[parentId!]! };
      newParentTask.subtasks.splice(newParentTask.subtasks.indexOf(taskId), 1);

      const newActive = boardData.panels[panelId]!.active.reduce(
        (newActive: string[], currTaskId: string) => {
          if (currTaskId === parentId) {
            return [...newActive, currTaskId, taskId];
          }
          return [...newActive, currTaskId];
        },
        []
      );

      setBoardData((prevState) => {
        return {
          ...prevState,
          todoTasks: {
            ...prevState.todoTasks,
            [parentId!]: newParentTask,
            [taskId]: {
              ...prevState.todoTasks[taskId]!,
              parent: null,
            },
          },
          panels: {
            ...prevState.panels,
            [panelId]: {
              ...prevState.panels[panelId]!,
              active: newActive,
            },
          },
        };
      });
    },
    handleToggleTask: (taskId: string, panelId: string) => {
      const { parent, isCompleted } = boardData.todoTasks[taskId]!;

      // If tasks is a subtask and is completed and parent is also completed
      // then move the entire item to active and set target to active
      if (parent && boardData.todoTasks[parent]!.isCompleted) {
        setBoardData((prevState) => {
          const newPanel = { ...boardData.panels[panelId]! };
          return {
            ...prevState,
            todoTasks: {
              ...prevState.todoTasks,
              [parent]: {
                ...prevState.todoTasks[parent]!,
                isCompleted: false,
              },
              [taskId]: {
                ...prevState.todoTasks[taskId]!,
                isCompleted: false,
              },
            },
            panels: {
              ...prevState.panels,
              [panelId]: {
                ...prevState.panels[panelId]!,
                active: [...newPanel.active, parent],
                completed: newPanel.completed.filter((id) => id !== parent),
              },
            },
          };
        });
        return;
      }

      // If task is a subtask and parent is not completed, just check/uncheck the task
      if (parent && !boardData.todoTasks[parent]!.isCompleted) {
        setBoardData((prevState) => ({
          ...prevState,
          todoTasks: {
            ...prevState.todoTasks,
            [taskId]: {
              ...prevState.todoTasks[taskId]!,
              isCompleted: !prevState.todoTasks[taskId]!.isCompleted,
            },
          },
        }));
        return;
      }

      // If task is top level item and is not completed, move to completed
      if (!parent && !isCompleted) {
        setBoardData((prevState) => {
          const newPanel = { ...prevState.panels[panelId]! };
          const newTodoTasks = { ...prevState.todoTasks };
          newTodoTasks[taskId]!.subtasks.forEach((subtaskId) => {
            newTodoTasks[subtaskId]!.isCompleted = true;
          });
          newTodoTasks[taskId]!.isCompleted = true;

          return {
            ...prevState,
            todoTasks: newTodoTasks,
            panels: {
              ...prevState.panels,
              [panelId]: {
                ...prevState.panels[panelId]!,
                active: newPanel.active.filter((id) => id !== taskId),
                completed: [...newPanel.completed, taskId],
              },
            },
          };
        });
      }

      // If task is top level item and is completed, move to active
      if (!parent && isCompleted) {
        setBoardData((prevState) => {
          const newPanel = { ...prevState.panels[panelId]! };
          return {
            ...prevState,
            todoTasks: {
              ...prevState.todoTasks,
              [taskId]: {
                ...prevState.todoTasks[taskId]!,
                isCompleted: false,
              },
            },
            panels: {
              ...prevState.panels,
              [panelId]: {
                ...prevState.panels[panelId]!,
                active: [...newPanel.active, taskId],
                completed: newPanel.completed.filter((id) => id !== taskId),
              },
            },
          };
        });
      }
    },
  };

  return (
    <div
      className="
      flex h-full items-start gap-3 overflow-auto
      bg-green-image bg-cover p-4
      "
    >
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="board" type="board" direction="horizontal">
          {(provided, snapshot) => {
            const dropZoneStyle = snapshot.isDraggingOver
              ? "bg-slate-200/30 shadow-md border-slate-200/20"
              : "";
            return (
              <div
                className="h-full"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <TransitionGroup
                  className={`flex gap-4 rounded pb-2 ${dropZoneStyle}
                  transition-all duration-500 ease-in-out`}
                >
                  {boardData.panelOrder.map((panelId, index) => (
                    <Collapse
                      key={panelId}
                      orientation="horizontal"
                      timeout={100}
                    >
                      <Draggable draggableId={panelId} index={index}>
                        {(provided, snapshot) => (
                          <Panel
                            style={provided.draggableProps.style}
                            provided={provided}
                            snapshot={snapshot}
                            panelData={boardData.panels[panelId]!}
                            boardData={boardData}
                            setBoardData={setBoardData}
                            newPanel={newPanel}
                            setNewPanel={setNewPanel}
                            handleDeletePanel={handleDeletePanel}
                            isItemCombineEnabled={isItemCombineEnabled}
                            {...taskProps}
                          />
                        )}
                      </Draggable>
                    </Collapse>
                  ))}
                  {provided.placeholder}
                </TransitionGroup>
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>

      {/* Create new panel button */}
      <Button
        sx={{
          backgroundColor: "rgba(220, 220, 220, 0.6)",
          border: "1px solid rgba(175, 175, 175, 0.36)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          borderRadius: "4px",
          maxWidth: "40px",
          maxHeight: "40px",
          minWidth: "40px",
          minHeight: "40px",
        }}
        color="success"
        onClick={handleCreateNewPanel}
      >
        <AddIcon color="action" />
      </Button>
    </div>
  );
};

export default BoardView;
