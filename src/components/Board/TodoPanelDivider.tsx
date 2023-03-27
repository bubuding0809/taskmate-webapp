import { Tooltip, Typography } from "@mui/material";
import { AntSwitch } from "../custom/AntSwitch";
import TaskIcon from "@mui/icons-material/Task";
import BorderLinearProgress from "../custom/BorderedLinearProgress";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/helper";
import TaskCreationModal from "./modals/TaskCreationModal";
import { useState } from "react";

import type { PanelWithTasks } from "server/api/routers/board";

interface TodoPanelDividerProps {
  activeCount: number;
  completedCount: number;
  panelItem: PanelWithTasks;
}

export const TodoPanelDivider: React.FC<TodoPanelDividerProps> = ({
  activeCount,
  completedCount,
  panelItem,
}: TodoPanelDividerProps) => {
  const [openModal, setOpenModal] = useState(false);
  const progressValue =
    activeCount + completedCount
      ? (completedCount / (activeCount + completedCount)) * 100
      : 0;

  return (
    <>
      <div className="flex h-10 items-center justify-between gap-2 px-2  text-white">
        <div className="flex h-6 w-full items-center rounded-full border-2 border-gray-400 bg-gray-200 dark:bg-gray-700">
          <div
            className={classNames(
              !progressValue ? "bg-transparent" : "bg-green-700",
              "h-full rounded-full text-center text-xs font-medium leading-none text-blue-100 transition-all delay-100 duration-200 ease-in-out"
            )}
            style={{ width: `${progressValue}%` }}
          >
            <p className="ml-2 h-full text-sm ">
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
    </>
  );
};
