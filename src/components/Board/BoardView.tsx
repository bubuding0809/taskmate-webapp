import { Collapse } from "@mui/material";
import React, { useEffect, useState } from "react";
import Panel from "@/components/Board/Panel";
import { PlusIcon } from "@heroicons/react/24/outline";
import { nanoid } from "nanoid";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { TransitionGroup } from "react-transition-group";
import { api } from "@/utils/api";
import { Session } from "next-auth";

import useCreatePanel from "@/utils/mutations/panel/useCreatePanel";
import useUpdatePanelOrder from "@/utils/mutations/panel/useUpdatePanelOrder";
import useUpdateTaskOrder from "@/utils/mutations/task/useUpdateTaskOrder";
import useUpdateSubtaskOrder from "@/utils/mutations/task/useUpdateSubTaskOrder";
import useCombineTask from "@/utils/mutations/task/useCombineTask";

import type { DragStart, DropResult } from "react-beautiful-dnd";

interface BoardViewProps {
  bid: string;
  sessionData: Session;
}

const BoardView: React.FC<BoardViewProps> = ({ bid, sessionData }) => {
  const [isItemCombineEnabled, setIsItemCombineEnabled] = useState(false);

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

  const handleCreateNewPanel = () => {
    // Create new panel and update state
    const newPanelId = nanoid(10);
    const panelCount = boardQueryData?.Panel.length;
    const currentPanelOrder = panelCount
      ? boardQueryData.Panel[panelCount - 1]!.order
      : 0;
    createPanel({
      userId: sessionData.user.id,
      boardId: bid,
      panelId: newPanelId,
      prevPanelOrder: currentPanelOrder,
    });
  };

  const onDragStart = (initial: DragStart) => {
    // ! Make sure to parse draggableId and droppableId to remove the "-drag" and "-drop" suffixes
    const { draggableId, source, type, mode } = initial;
    console.log(source.droppableId, draggableId);

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
      className="
        flex h-full flex-col items-start gap-3 overflow-auto
        bg-green-image bg-cover p-4
        "
    >
      <div className="min-w-max rounded-md border bg-white px-4 py-2 text-xl font-bold shadow-md">
        {boardQueryData?.board_title}
      </div>
      <div className="flex h-full items-start">
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          {/* Droppable zone for panels */}
          <Droppable droppableId={bid} type="board" direction="horizontal">
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
                    {boardQueryData?.Panel.map((panelItem, index) => (
                      <Collapse
                        key={panelItem.id}
                        orientation="horizontal"
                        timeout={100}
                      >
                        <Draggable
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
        <button
          type="button"
          className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white/60 p-2 text-base font-medium text-gray-700 shadow-sm backdrop-blur-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleCreateNewPanel}
        >
          <PlusIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default BoardView;
