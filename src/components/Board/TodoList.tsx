import React, { useRef, useEffect } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { TodoItem } from "./TodoItem";

import type {
  PanelWithTasks,
  TaskWithSubtasks,
} from "server/api/routers/board";

interface TodoListProps {
  taskListType: "active" | "completed";
  panelItem: PanelWithTasks;
  tasks: TaskWithSubtasks[];
  isItemCombineEnabled: boolean;
}

export const TodoList: React.FC<TodoListProps> = ({
  taskListType,
  panelItem,
  tasks,
  isItemCombineEnabled,
}: TodoListProps) => {
  // * Do not make the list droppable if it is a completed list
  if (taskListType === "completed") {
    return (
      <div className="m-2 flex flex-col gap-1.5 rounded transition-all delay-100 duration-200 ease-in-out">
        {tasks.length ? (
          // Only diplays tasks parent tasks in the list, subtasks will be nested under their parent
          tasks.map((task, index) => (
            // TODO - Remove commented code when finalizing the feature
            // <Draggable
            //   key={`${task.id}-drag`}
            //   draggableId={`${task.id}-drag`}
            //   index={index}
            //   isDragDisabled={task.is_completed}
            // >
            // {(provided, snapshot) => {
            //   return (
            <TodoItem
              key={task.id}
              taskListType={taskListType}
              task={task}
              panelItem={panelItem}
            />
            // );
            // }}
            // </Draggable>
          ))
        ) : (
          <div className="py-2 text-center">
            <p>No tasks</p>
          </div>
        )}
      </div>
    );
  }

  // * Make the list droppable if it is an active list
  return (
    <Droppable
      droppableId={`${panelItem.id}-drop`}
      type={`${taskListType}-task`}
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
            panelItem.Task.map((task) => task.id).includes(
              draggingFromThisWith!
            )
          ) {
            return "bg-[#eefffd] shadow-inner";
          }
          return "";
        };

        return (
          <div
            className={`m-2 flex flex-col gap-1.5 rounded transition-all delay-100 duration-200 ease-in-out
              ${taskListStyle()}
            `}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.length ? (
              // Only diplays tasks parent tasks in the list, subtasks will be nested under their parent
              tasks.map((task, index) => (
                <Draggable
                  key={`${task.id}-drag`}
                  draggableId={`${task.id}-drag`}
                  index={index}
                  isDragDisabled={task.is_completed}
                >
                  {(provided, snapshot) => {
                    return (
                      <TodoItem
                        taskListType={taskListType}
                        task={task}
                        style={provided.draggableProps.style}
                        panelItem={panelItem}
                        provided={provided}
                        snapshot={snapshot}
                      />
                    );
                  }}
                </Draggable>
              ))
            ) : (
              <div className="py-2 text-center">
                <p>No tasks</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
};
