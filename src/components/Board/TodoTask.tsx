import React, { useRef, useState, useEffect, useMemo } from "react";
import { Chip, Tooltip, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import autoAnimate from "@formkit/auto-animate";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { TodoTaskMenu } from "./TodoTaskMenu";
import { BpCheckBox } from "../custom/BpCheckBox";

import type {
  PanelWithTasks,
  TaskWithSubtasks,
} from "server/api/routers/board";
import { formatDate } from "@/utils/helper";
import useToggleTaskStatus from "@/utils/mutations/task/useToggleTaskStatus";

import UserModal from "../Dashboard/UserModal";
import { User } from "@prisma/client";
import { UserMinusIcon } from "@heroicons/react/20/solid";
import { api } from "@/utils/api";
import useRemoveAssignee from "@/utils/mutations/task/useRemoveAssignee";

interface TodoTaskProps {
  task: TaskWithSubtasks;
  panelItem: PanelWithTasks;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  handleRemoveDateTime: (taskId: string, panelId: string) => void;
}

// Style for dragged task
const draggedStyle = (snapshot: DraggableStateSnapshot | undefined): string => {
  return snapshot?.isDragging
    ? "rounded border-3 border-slate-700 bg-slate-50/80 shadow-solid-small"
    : "";
};

export const TodoTask: React.FC<TodoTaskProps> = ({
  task,
  panelItem,
  provided,
  snapshot,
  handleRemoveDateTime,
}) => {
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

  const handleToggleTask = (toggledTask: typeof task) => {
    const { id, panel_id, is_completed, parentTaskId } = toggledTask;

    // Mutation to toggle task completion
    toggleTask({
      boardId: panelItem.board_id,
      panelId: panel_id,
      taskId: id,
      parentTaskId: parentTaskId,
      completed: !is_completed,
    });
  };

  return (
    <div
      className={`
      relative flex items-center justify-between 
      px-1 py-1 
      ${draggedStyle(snapshot)}
    `}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* todo item content */}
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
            onChange={() => handleToggleTask(task)}
          />
          <Typography
            sx={{
              textDecoration: task.is_completed ? "line-through" : "",
              width: "100%",
            }}
          >
            {task.task_title}
          </Typography>
          {isHover && (
            <div className="absolute -right-0.5 top-0">
              <TodoTaskMenu task={task} panelItem={panelItem} />
            </div>
          )}
        </div>
        {/* Task assignees */}
        {task.Task_Assign_Rel && task.Task_Assign_Rel.length > 0 && (
          <div className="ml-5 flex items-center">
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
          {task.task_details && (
            <div className="flex gap-1">
              <DescriptionIcon
                sx={{
                  color: "#9cb380",
                  opacity: 0.8,
                  fontSize: "18px",
                }}
              />
              <Typography
                textAlign="left"
                variant="body2"
                color="textSecondary"
              >
                {task.task_details}
              </Typography>
              {/* Show delete button on hover */}
            </div>
          )}
          {task.due_datetime && (
            <Chip
              sx={{
                color: "text.secondary",
                paddingLeft: "5px",
              }}
              variant="outlined"
              size="small"
              label={formatDate(task.due_datetime)}
              icon={<CalendarMonthIcon />}
              onDelete={
                task.is_completed
                  ? undefined
                  : () => handleRemoveDateTime(task.id, panelItem.id)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
