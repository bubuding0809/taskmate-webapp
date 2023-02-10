import autoAnimate from "@formkit/auto-animate";
import React, { useRef, useEffect, useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { BoardType, PanelType, Todo } from "../utils/types";
import { TodoItem } from "./TodoItem";
import { TransitionGroup } from "react-transition-group";
import { Collapse } from "@mui/material";

interface TodoListProps {
  type: "active" | "completed";
  boardData: BoardType;
  panelData: PanelType;
  todoList: string[];
  isItemCombineEnabled: boolean;
  handleDeleteTask: (taskId: string, panelId: string) => void;
  handleUnappendSubtask: (taskId: string, panelId: string) => void;
  handleToggleTask: (taskId: string, panelId: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  type,
  boardData,
  panelData,
  todoList,
  isItemCombineEnabled,
  handleDeleteTask,
  handleUnappendSubtask,
  handleToggleTask,
}: TodoListProps) => {
  // Set up autoAnimation of div element
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <Droppable
      droppableId={`${panelData.id}-${type}`}
      type={`panel-${type}`}
      isCombineEnabled={isItemCombineEnabled}
    >
      {(provided, snapshot) => {
        const { isDraggingOver, draggingFromThisWith, draggingOverWith } =
          snapshot;
        const taskListStyle = () => {
          if (isDraggingOver) {
            return "bg-[#F0F7EC] shadow-inner";
          } else if (
            !draggingOverWith &&
            panelData.active.includes(draggingFromThisWith!)
          ) {
            return "bg-[#eefffd] shadow-inner";
          }
          return "";
        };

        return (
          <div
            className={`m-2 rounded transition-all delay-100 duration-200 ease-in-out
              ${taskListStyle()}
            `}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <TransitionGroup className="flex flex-col gap-1.5">
              {todoList.length ? (
                todoList.map((taskId, index) => (
                  <Collapse key={taskId} timeout={100}>
                    <Draggable draggableId={taskId} index={index}>
                      {(provided, snapshot) => (
                        <TodoItem
                          task={boardData.todoTasks[taskId]!}
                          style={provided.draggableProps.style}
                          boardData={boardData}
                          panelData={panelData}
                          provided={provided}
                          snapshot={snapshot}
                          handleDeleteTask={handleDeleteTask}
                          handleUnappendSubtask={handleUnappendSubtask}
                          handleToggleTask={handleToggleTask}
                        />
                      )}
                    </Draggable>
                  </Collapse>
                ))
              ) : (
                <Collapse>
                  <div className="py-2 text-center">
                    <p>No tasks</p>
                  </div>
                </Collapse>
              )}
            </TransitionGroup>
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
};
