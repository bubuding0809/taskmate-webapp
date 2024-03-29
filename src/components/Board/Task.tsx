/* DONE BY: Ding RuoQian 2100971 */

import { useToastContext } from "@/utils/context/ToastContext";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Chip, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { User } from "@prisma/client";
import { PencilIcon, UserMinusIcon } from "@heroicons/react/20/solid";
import autoAnimate from "@formkit/auto-animate";
import TaskEditSlideover from "@/components/Board/TaskEditSlideover";
import UserModal from "@/components/Modal/UserModal";
import { TaskMenu } from "@/components/Board/TaskMenu";
import { BpCheckBox } from "../custom/BpCheckBox";
import { classNames, formatDate } from "@/utils/helper";
import useToggleTaskStatus from "@/utils/mutations/task/useToggleTaskStatus";
import useRemoveAssignee from "@/utils/mutations/task/useRemoveAssignee";
import { generateText } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Color from "@tiptap/extension-color";
import { ClockIcon } from "@heroicons/react/20/solid";

import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import type { RouterOutputs } from "@/utils/api";
import type { Optional } from "@/utils/types";

type ExtractPanel<T> = T extends { Panel: infer U } ? U : never;
type Panel = ExtractPanel<RouterOutputs["board"]["getBoardById"]>[number];
type Task = Optional<Panel["Task"][number], "subtasks">;

interface TaskProps {
  task: Task;
  panelItem: Panel;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
}

// Style for dragged task
const draggedStyle = (snapshot: DraggableStateSnapshot | undefined): string => {
  return snapshot?.isDragging
    ? "rounded border-3 border-slate-700 bg-slate-50/80 shadow-solid-sm"
    : "";
};

export const Task: React.FC<TaskProps> = ({
  task,
  panelItem,
  provided,
  snapshot,
}) => {
  const addToast = useToastContext();

  // Set up autoAnimation of ul element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // set up hover state to show task menu button on hover
  const [isHover, setIsHover] = useState<boolean>(false);

  // Mutation to toggle task completion
  const { mutate: toggleTask } = useToggleTaskStatus();

  // Mutation to remove user from task
  const { mutateAsync: unassignUser, isLoading: isRemovingUser } =
    useRemoveAssignee();

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  // State to handle edit task slideover
  const [openEditTaskSlideover, setOpenEditTaskSlideover] = useState(false);

  // Generate text from task description json
  const descriptonText = useMemo(() => {
    // Make sure task description is json
    if (
      typeof task.task_description === "string" ||
      typeof task.task_description === "number" ||
      typeof task.task_description === "boolean" ||
      task.task_description === null
    ) {
      return "";
    }

    // Else, generate text from json
    return generateText(task.task_description, [
      StarterKit,
      Collaboration,
      CollaborationCursor,
      Color,
      Highlight,
      Placeholder,
      Typography,
    ]);
  }, [task.task_description]);

  return (
    <>
      <div
        className={`
      relative flex items-center justify-between 
      px-1 py-1 
      ${draggedStyle(snapshot)}
    `}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div className="mr-4 flex w-full flex-col items-stretch">
          {/* CheckBox and task title */}
          <div
            className="flex items-start justify-start gap-1"
            {...provided?.dragHandleProps}
          >
            <BpCheckBox
              className="self-start"
              name={task.id}
              checked={task.is_completed}
              onChange={() => {
                // Mutation to toggle task completion
                toggleTask({
                  boardId: panelItem.board_id,
                  panelId: task.panel_id,
                  taskId: task.id,
                  parentTaskId: task.parentTaskId,
                  completed: !task.is_completed,
                });
              }}
            />
            <p
              className={classNames(
                task.is_completed && "line-through",
                "w-full font-medium"
              )}
            >
              {task.task_title}
            </p>

            {/* Button group - visible on hover */}
            {isHover && (
              <span className="absolute right-1 top-1 isolate z-10 inline-flex rounded-md shadow-sm">
                <Tooltip title="Edit Task" placement="top">
                  <button
                    type="button"
                    className="relative inline-flex items-center rounded-l-md bg-white px-2 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                    onClick={() => setOpenEditTaskSlideover(true)}
                  >
                    <span className="sr-only">Edit Task</span>
                    <PencilIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Tooltip>
                <TaskMenu task={task} panelItem={panelItem} />
              </span>
            )}
          </div>

          {/* Task assignees */}
          {task.Task_Assign_Rel && task.Task_Assign_Rel.length > 0 && (
            <div className="ml-6 flex items-center">
              <div className="flex space-x-1 overflow-hidden p-1">
                {task.Task_Assign_Rel?.map(({ User: user }) => (
                  <Tooltip
                    key={user.id}
                    title={user.name}
                    className="cursor-pointer"
                    onClick={() => {
                      setCurrUser(user);
                      setOpenUserModal(true);
                    }}
                  >
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white hover:ring-indigo-600"
                      src={
                        user.image ??
                        "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      }
                      alt={user.name ?? "user image"}
                    />
                  </Tooltip>
                ))}
              </div>

              {/* Only shown when collaborator avatar is clicked */}
              <UserModal
                open={openUserModal}
                setOpen={setOpenUserModal}
                user={currUser}
                actions={[
                  {
                    callback: async () => {
                      // Remove assignee from task
                      await unassignUser({
                        boardId: panelItem.board_id,
                        panelId: panelItem.id,
                        taskId: task.id,
                        assigneeId: currUser?.id ?? "",
                      });
                      return true;
                    },
                    icon: UserMinusIcon,
                    loading: isRemovingUser,
                    name: "Unassign",
                  },
                ]}
              />
            </div>
          )}

          {/* Task details: description, time, etc... */}
          <div ref={parent} className="ml-6 flex flex-col items-start gap-1">
            {/* details */}
            {task.task_description && (
              <Tooltip
                title="Details"
                placement="right-start"
                className="cursor-copy p-1 transition-all duration-200 hover:rounded-md hover:bg-gray-300/50"
              >
                <p
                  className="text-start text-sm leading-snug text-gray-500 line-clamp-5"
                  onClick={() => {
                    // Copy task details to clipboard
                    void navigator.clipboard.writeText(descriptonText);

                    // Show toast
                    addToast({
                      icon: ClipboardDocumentCheckIcon,
                      title: "Copied to clipboard",
                      description:
                        "Task details copied successfully to clipboard",
                    });
                  }}
                >
                  {descriptonText}
                </p>
              </Tooltip>
            )}

            {/* due date */}
            {task.due_datetime && (
              <Chip
                variant="outlined"
                size="small"
                label={formatDate(task.due_datetime)}
                icon={<ClockIcon className="h-5 w-5" />}
                color={(() => {
                  const today = new Date();
                  const dueDate = new Date(task.due_datetime);

                  // If due date is today, show warning color else if due date is in the past, show error color
                  if (dueDate.getDate() === today.getDate()) {
                    return "warning";
                  } else if (dueDate < today) {
                    return "error";
                  }
                  return "default";
                })()}
              />
            )}
          </div>
        </div>
      </div>

      <TaskEditSlideover
        open={openEditTaskSlideover}
        setOpen={setOpenEditTaskSlideover}
        task={task}
        panel={panelItem}
      />
    </>
  );
};
