/* DONE BY: Ding RuoQian 2100971 */

import { PlusIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/helper";
import TaskCreationModal from "../modal/TaskCreationModal";
import { useState } from "react";
import useUpdatePanelTitle from "@/utils/mutations/panel/useUpdatePanelTitle";
import { IconButton, Tooltip } from "@mui/material";
import { Save } from "@mui/icons-material";
import { AntSwitch } from "@/components/custom/AntSwitch";
import { PanelMenu } from "@/components/board/PanelMenu";

import type { PanelWithTasks } from "server/api/routers/board";
import type { DraggableProvided } from "react-beautiful-dnd";

interface PanelHeaderProps {
  activeCount: number;
  completedCount: number;
  panelItem: PanelWithTasks;
  provided: DraggableProvided;
  isReveal: boolean;
  setIsReveal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  activeCount,
  completedCount,
  panelItem,
  provided,
  isReveal,
  setIsReveal,
}: PanelHeaderProps) => {
  const [openModal, setOpenModal] = useState(false);

  // UI state to toggle panel title edit mode
  const [isEditPanelTitle, setIsEditPanelTitle] = useState(false);

  // UI state to control panel title input
  const [panelTitle, setPanelTitle] = useState<string>(
    panelItem.panel_title ?? "Untitled"
  );

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

  // Function to calculate progress bar value
  const getProgressValue = () => {
    // Get total number of tasks in panel
    const totalCount = activeCount + completedCount;

    // Return 0 if no tasks in panel
    if (!totalCount) return 0;

    // Return percentage of completed tasks
    return (completedCount / totalCount) * 100;
  };

  return (
    <div {...provided.dragHandleProps} className="flex flex-col rounded-t">
      <div className="flex items-center justify-between px-2 pt-2">
        {!isEditPanelTitle ? (
          // Panel title
          <Tooltip title="Double-click to edit" placement="top-start">
            <h3
              className="cursor-pointer truncate text-xl font-semibold text-gray-900"
              onDoubleClick={() => setIsEditPanelTitle(true)}
            >
              {panelItem.panel_title ?? "Untitled"}
            </h3>
          </Tooltip>
        ) : (
          // Panel title edit form
          <form
            className={`animate__animated w-full ${
              isAnimateError ? "animate__headShake" : ""
            }`}
            onSubmit={handleSavePanelTitle}
          >
            <div className="relative">
              <input
                autoFocus
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 pr-8 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xl sm:leading-6"
                placeholder="Panel title"
                value={panelTitle}
                onChange={(e) => setPanelTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyUp={(e) => {
                  if (e.key === "Escape") {
                    setIsEditPanelTitle(false);
                  }
                }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                }}
                size="small"
                onClick={handleSavePanelTitle}
              >
                <Save
                  sx={{
                    fontSize: "20px",
                  }}
                />
              </IconButton>
            </div>
          </form>
        )}
        <div className="flex items-center">
          {/* Toggle for completed tasks */}
          <Tooltip title="Show completed tasks" placement="top-start">
            <div className="flex cursor-pointer items-center gap-1 rounded-full border bg-white px-2 py-1">
              <label
                className={classNames(
                  isReveal ? "text-emerald-700" : "text-gray-500",
                  "text-xs font-medium"
                )}
              >
                Completed
              </label>
              <AntSwitch
                onChange={() =>
                  setIsReveal((prevState) => {
                    return !prevState;
                  })
                }
                checked={isReveal}
              />
            </div>
          </Tooltip>
          <PanelMenu panelItem={panelItem} />
        </div>
      </div>

      <div className="flex h-10 items-center justify-between gap-2 px-2  text-white">
        <div className="flex h-6 w-full items-center rounded-full border-2 border-gray-400 bg-gray-200 dark:bg-gray-700">
          <div
            className={classNames(
              !getProgressValue() ? "bg-transparent" : "bg-green-700",
              "h-full rounded-full text-center text-xs font-medium leading-none text-blue-100 transition-all delay-100 duration-200 ease-in-out"
            )}
            style={{ width: `${getProgressValue()}%` }}
          >
            <p className="ml-2 h-full text-center text-sm leading-[1.4rem]">
              {`${completedCount}/${activeCount + completedCount}`}
            </p>
          </div>
        </div>

        {/* Button to open task creation modal */}
        <button
          type="button"
          className="flex rounded-full bg-white py-0.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={() => setOpenModal(true)}
        >
          Task
          <PlusIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
        </button>
      </div>
      <TaskCreationModal
        open={openModal}
        setOpen={setOpenModal}
        panelItem={panelItem}
        bid={panelItem.board_id}
      />
    </div>
  );
};
