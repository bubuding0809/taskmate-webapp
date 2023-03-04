import React, { FormEventHandler, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { TodoEntryForm } from "./TodoEntryForm";
import { TodoMain } from "./TodoMain";
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import useCreateTask from "@/utils/mutations/task/useCreateTask";

import type { EntryType } from "../../utils/types";
import type { PanelWithTasks } from "server/api/routers/board";
import { classNames } from "@/utils/helper";

interface PanelProps {
  style: DraggingStyle | NotDraggingStyle | undefined;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  panelItem: PanelWithTasks;
  isItemCombineEnabled: boolean;
}

const Panel = ({
  style,
  provided,
  snapshot,
  panelItem,
  isItemCombineEnabled,
}: PanelProps): JSX.Element => {
  const [newEntry, setNewEntry] = useState<EntryType>({
    todoMessage: "",
    todoDateTime: null,
    todoDescription: "",
  });

  // Animate panel on mount
  const [isAnimateEnter, setIsAnimateEnter] = useState(false);
  useEffect(() => {
    setIsAnimateEnter(true);

    const timeout = setTimeout(() => {
      setIsAnimateEnter(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Mutation to create new task
  const { mutate: createTask } = useCreateTask();

  //handle new todo entry
  const handleNewEntry: FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    const { todoMessage, todoDateTime, todoDescription } = newEntry;
    todoDateTime?.toDate();

    // Ensure that the todoMessage is not empty
    if (!todoMessage.trim()) {
      alert("Enter a task mate");
      return;
    }

    // Update active list with new item
    const newTaskId = nanoid();
    const rootTasks = panelItem.Task.filter((task) => !task.parentTaskId);
    const postTaskOrder = rootTasks.length ? rootTasks[0]!.order : 0;

    // Mutation to add new task to panel
    createTask({
      boardId: panelItem.board_id,
      panelId: panelItem.id,
      taskId: newTaskId,
      postTaskOrder: postTaskOrder,
      title: todoMessage,
      details: todoDescription,
      dueDate: todoDateTime?.toDate(),
    });

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
      className={classNames(
        // isAnimateEnter && "animate__bounceInDown animate__faster",
        "flex w-80 min-w-sm max-w-sm flex-col gap-2"
      )}
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
        panelItem={panelItem}
        isItemCombineEnabled={isItemCombineEnabled}
      />
    </div>
  );
};

export default Panel;
