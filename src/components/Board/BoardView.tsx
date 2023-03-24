import React, { useState } from "react";
import Panel from "@/components/Board/Panel";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { nanoid } from "nanoid";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { api } from "@/utils/api";
import { classNames } from "@/utils/helper";
import { Tooltip } from "@mui/material";
import UserModal from "../Dashboard/UserModal";
import UserSearchPopover from "../Dashboard/UserSearchPopover";
import { User } from "@prisma/client";

import useCreatePanel from "@/utils/mutations/panel/useCreatePanel";
import useUpdatePanelOrder from "@/utils/mutations/panel/useUpdatePanelOrder";
import useUpdateTaskOrder from "@/utils/mutations/task/useUpdateTaskOrder";
import useUpdateSubtaskOrder from "@/utils/mutations/task/useUpdateSubtaskOrder";
import useCombineTask from "@/utils/mutations/task/useCombineTask";

import type { DragStart, DropResult } from "react-beautiful-dnd";

interface BoardViewProps {
  bid: string;
}

// TODO - tempory background images, to be replaced with hitting a unsplash API
const backgroundImages: {
  name: string;
  url: string;
}[] = [
  {
    name: "🌲",
    url: "/images/paul-weaver-unsplash.jpeg",
  },
  {
    name: "🌳",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2600&q=80",
  },
  {
    name: "🌊",
    url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2462&q=80",
  },
];

const BoardView: React.FC<BoardViewProps> = ({ bid }) => {
  const [isItemCombineEnabled, setIsItemCombineEnabled] = useState(false);
  const [bgImage, setBgImage] = useState<string>(
    "/images/paul-weaver-unsplash.jpeg"
  );

  // Query to get board data
  const { data: boardQueryData } = api.board.getBoardById.useQuery({
    boardId: bid,
  });

  // Query to get a map of all tasks in a board
  const { data: taskMapData } = api.board.getTasksMapByBoardId.useQuery({
    boardId: bid,
  });

  // Mutations to update panels in database
  const { mutate: createPanel } = useCreatePanel();
  const { mutate: reorderPanel } = useUpdatePanelOrder();
  const { mutate: reorderTask } = useUpdateTaskOrder();
  const { mutate: combineTaskWithParent } = useCombineTask();
  const { mutate: reorderSubTask } = useUpdateSubtaskOrder();

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  const handleCreateNewPanel = () => {
    // Create new panel and update state
    const newPanelId = nanoid(10);
    const panelCount = boardQueryData?.Panel.length;
    const currentPanelOrder = panelCount
      ? boardQueryData.Panel[panelCount - 1]!.order
      : 0;
    createPanel({
      userId: boardQueryData!.user_id,
      boardId: bid,
      panelId: newPanelId,
      prevPanelOrder: currentPanelOrder,
    });
  };

  const onDragStart = (initial: DragStart) => {
    // ! Make sure to parse draggableId and droppableId to remove the "-drag" and "-drop" suffixes
    const { draggableId, source, type, mode } = initial;

    // If draggable is a from the active panel, enable item combine based on if the draggable has subtasks
    if (type === "active-task") {
      const draggedTask = taskMapData?.get(draggableId.replace("-drag", ""));

      // If draggable has subtasks, disable item combine, else enable item combine
      draggedTask?.subtasks.length
        ? setIsItemCombineEnabled(false)
        : setIsItemCombineEnabled(true);
      return;
    }
  };

  const onDragEnd = (result: DropResult) => {
    // ! Make sure to parse draggableId and droppableId to remove the "-drag" and "-drop" suffixes
    const { draggableId, destination, source, type, combine } = result;

    // * Combine a draggable task with a root task if item combine is enabled
    if (combine) {
      const { draggableId: parentTaskId, droppableId: panelId } = combine;

      // Get the order of the last subtask of the parent task
      const parentTask = taskMapData?.get(parentTaskId.replace("-drag", ""));
      const lastSubtaskOrder =
        parentTask?.subtasks[parentTask.subtasks.length - 1]?.order ?? 0;

      // Mutation to combine task with parent
      combineTaskWithParent({
        boardId: bid,
        panelId: panelId.replace("-drop", ""),
        taskId: draggableId.replace("-drag", ""),
        parentTaskId: parentTaskId.replace("-drag", ""),
        order: lastSubtaskOrder,
      });
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

    // * Handle drag and drop for panels
    if (type === "board") {
      let newPanelOrder;

      // If panel is dropped at the end of the board, set the new order of the panel to the order of the last panel + 100
      if (destination.index === boardQueryData!.Panel.length - 1) {
        newPanelOrder = boardQueryData!.Panel[destination.index]!.order + 100;
      } else {
        // If panel is dropped in the middle of the board, set the new order of the panel to the average of the order of the panel before and after the drop location
        let beforePanelOrder;
        let afterPanelOrder;

        if (destination.index > source.index) {
          beforePanelOrder = boardQueryData!.Panel[destination.index]!.order;
          afterPanelOrder = boardQueryData!.Panel[destination.index + 1]!.order;
        } else {
          beforePanelOrder =
            boardQueryData!.Panel[destination.index - 1]?.order ?? 0;
          afterPanelOrder = boardQueryData!.Panel[destination.index]!.order;
        }
        newPanelOrder = Math.floor((beforePanelOrder + afterPanelOrder) / 2);
      }
      reorderPanel({
        boardId: bid,
        panelId: draggableId.replace("-drag", ""),
        order: newPanelOrder,
      });
    }

    // * Handle drag drop of tasks in active panels
    if (type === "active-task") {
      let newTaskOrder: number;

      // get the destination panel
      const destinationPanel = boardQueryData?.Panel.find(
        (panel) => panel.id === destination.droppableId.replace("-drop", "")
      );

      // If task is dropped within the same panel, update the order of the task
      if (source.droppableId === destination.droppableId) {
        // If task is dropped at the end of the panel, set the new order of the task to the order of the last task + 100
        if (destination.index === destinationPanel!.Task.length - 1) {
          newTaskOrder = destinationPanel!.Task[destination.index]!.order + 100;
        } else {
          // If task is dropped in the middle of the panel, set the new order of the task to the average of the order of the task before and after the drop location
          let beforeTaskOrder;
          let afterTaskOrder;

          if (destination.index > source.index) {
            beforeTaskOrder = destinationPanel!.Task[destination.index]!.order;
            afterTaskOrder =
              destinationPanel!.Task[destination.index + 1]!.order;
          } else {
            beforeTaskOrder =
              destinationPanel!.Task[destination.index - 1]?.order ?? 0;
            afterTaskOrder = destinationPanel!.Task[destination.index]!.order;
          }

          newTaskOrder = Math.floor((beforeTaskOrder + afterTaskOrder) / 2);
        }
      }
      // If task is dropped in a different panel, update the order of the task and move the task to the new panel
      else {
        if (destination.index === destinationPanel!.Task.length) {
          newTaskOrder =
            (destinationPanel!.Task[destination.index - 1]?.order ?? 0) + 100;
        } else {
          // If task is dropped in the middle of the panel, set the new order of the task to the average of the order of the task before and after the drop location
          const beforeTaskOrder =
            destinationPanel!.Task[destination.index - 1]?.order ?? 0;
          const afterTaskOrder =
            destinationPanel!.Task[destination.index]!.order;
          newTaskOrder = Math.floor((beforeTaskOrder + afterTaskOrder) / 2);
        }
      }

      // Mutation to update task order
      reorderTask({
        boardId: bid,
        sourcePanelId: source.droppableId.replace("-drop", ""),
        destinationPanelId: destinationPanel!.id,
        taskId: draggableId.replace("-drag", ""),
        order: newTaskOrder,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });
    }

    // * Handle drag drop of subtasks in active panels
    if (type === "active-subtask") {
      let newSubTaskOrder;

      // Get the dragged task
      const draggedTask = taskMapData?.get(draggableId.replace("-subtask", ""));

      // Get the source parent task
      const sourceParentTask = taskMapData?.get(draggedTask!.parentTaskId!);
      // Get the source panel
      const sourcePanel = boardQueryData?.Panel.find(
        (panel) => panel.id === sourceParentTask?.panel_id
      );

      // Get the destination parent task
      const destinationParentTask = taskMapData?.get(
        destination.droppableId.replace("-drop", "")
      );
      // Get the destination panel
      const destinationPanel = boardQueryData?.Panel.find(
        (panel) => panel.id === destinationParentTask?.panel_id
      );

      // If subtask is dropped within the same parent task, update the order of the subtask1
      if (sourceParentTask?.id === destinationParentTask?.id) {
        // If subtask is dropped at the end of the parent task, set the new order of the subtask to the order of the last subtask + 100
        if (destination.index === destinationParentTask!.subtasks.length - 1) {
          newSubTaskOrder =
            destinationParentTask!.subtasks[destination.index]!.order + 100;
        } else {
          // If subtask is dropped in the middle of the parent task, set the new order of the subtask to the average of the order of the subtask before and after the drop location
          let beforeSubTaskOrder;
          let afterSubTaskOrder;

          if (destination.index > source.index) {
            beforeSubTaskOrder =
              destinationParentTask!.subtasks[destination.index]!.order;
            afterSubTaskOrder =
              destinationParentTask!.subtasks[destination.index + 1]!.order;
          } else {
            beforeSubTaskOrder =
              destinationParentTask!.subtasks[destination.index - 1]?.order ??
              0;
            afterSubTaskOrder =
              destinationParentTask!.subtasks[destination.index]!.order;
          }

          newSubTaskOrder = Math.floor(
            (beforeSubTaskOrder + afterSubTaskOrder) / 2
          );
        }
      } else {
        if (destination.index === destinationParentTask!.subtasks.length) {
          newSubTaskOrder =
            (destinationParentTask!.subtasks[destination.index - 1]?.order ??
              0) + 100;
        } else {
          // If subtask is dropped in the middle of the parent task, set the new order of the subtask to the average of the order of the subtask before and after the drop location
          const beforeSubTaskOrder =
            destinationParentTask!.subtasks[destination.index - 1]?.order ?? 0;
          const afterSubTaskOrder =
            destinationParentTask!.subtasks[destination.index]!.order;
          newSubTaskOrder = Math.floor(
            (beforeSubTaskOrder + afterSubTaskOrder) / 2
          );
        }
      }

      reorderSubTask({
        boardId: bid,
        taskId: draggableId.replace("-subtask", ""),
        order: newSubTaskOrder,
        sourcePanelId: sourcePanel!.id,
        sourceParentTaskId: sourceParentTask!.id,
        destinationPanelId: destinationPanel!.id,
        destinationParentTaskId: destinationParentTask!.id,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });
    }
  };

  return (
    <div
      className={classNames(
        bgImage,
        "flex h-full flex-1 flex-col items-start gap-3 overflow-auto bg-cover p-4"
      )}
      style={{
        backgroundImage: `url('${bgImage}')`,
      }}
    >
      {/* Board header */}
      <div className="sticky top-0 z-10 flex min-w-max items-center gap-2 space-x-2 rounded-md border bg-white px-4 py-2 text-2xl font-bold shadow-md">
        <div>
          <span className="mr-2">{boardQueryData?.thumbnail_image}</span>
          {boardQueryData?.board_title}
        </div>

        {/* Show collaborators of the board */}
        <>
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              {boardQueryData?.Board_Collaborator.map(({ User: user }) => (
                <div key={user.id} className="relative">
                  <Tooltip
                    title={user.name ?? ""}
                    className="cursor-pointer rounded-full hover:opacity-75"
                    onClick={() => {
                      setCurrUser(user);
                      setOpenUserModal(true);
                    }}
                  >
                    <img
                      // prevent images from being compressed
                      className="h=[26px] inline-block w-[26px] rounded-full sm:h-8 sm:w-8"
                      src={user.image ?? ""}
                      alt={user.name ?? ""}
                    />
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

          {/* Only shown when collaborator avatar is clicked */}
          <UserModal
            open={openUserModal}
            setOpen={setOpenUserModal}
            user={currUser}
          />
        </>

        {/* Create a select dropdown to choose background images */}
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border-gray-300 text-sm text-gray-500 focus:border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            onChange={(e) => {
              setBgImage(e.target.value);
            }}
            value={bgImage}
            id="bg-image"
          >
            {backgroundImages.map((image) => {
              return (
                <option key={image.url} value={image.url}>
                  {image.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Board Main*/}
      <div className="flex flex-1 items-start">
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          {/* Droppable zone for panels */}
          <Droppable droppableId={bid} type="board" direction="horizontal">
            {(provided, snapshot) => {
              const dropZoneStyle = snapshot.isDraggingOver
                ? "bg-slate-200/30 shadow-md border-slate-200/20"
                : "";
              return (
                <div
                  className={classNames(
                    dropZoneStyle,
                    "flex h-full gap-4 rounded pb-2 transition-all duration-500 ease-in-out"
                  )}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {boardQueryData?.Panel.map((panelItem, index) => (
                    <Draggable
                      key={panelItem.id}
                      draggableId={`${panelItem.id}-drag`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Panel
                          style={provided.draggableProps.style}
                          provided={provided}
                          snapshot={snapshot}
                          panelItem={panelItem}
                          isItemCombineEnabled={isItemCombineEnabled}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        </DragDropContext>

        {/* Create new panel button */}
        <button
          type="button"
          className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white/60 p-2 text-base font-medium text-gray-700 shadow-sm backdrop-blur-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleCreateNewPanel}
        >
          <PlusIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Attribution to unsplash image creator */}
      <p className="absolute bottom-2 right-3 text-xs text-gray-700">
        Photo by{" "}
        <a
          href="https://unsplash.com/@willianjusten"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-gray-800"
        >
          Willian Justen de Vasconcellos
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/7kCNXfo35aU"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-gray-800"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
};

export default BoardView;
