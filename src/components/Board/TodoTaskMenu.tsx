import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, Tooltip, Typography, Fade } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ClearIcon from "@mui/icons-material/Clear";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import useDeleteTask from "@/utils/mutations/task/useDeleteTask";
import useUnappendSubtask from "@/utils/mutations/task/useUnappendSubtask";

import type { PanelWithTasks } from "server/api/routers/board";
import type { Task } from "@prisma/client";
import type { TaskDetailed } from "server/api/routers/board";

interface TodoTaskMenuProps {
  task: TaskDetailed | Task;
  panelItem: PanelWithTasks;
}

export const TodoTaskMenu: React.FC<TodoTaskMenuProps> = ({
  task,
  panelItem,
}: TodoTaskMenuProps) => {
  // Anchor ref to handle closing and opening of menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mutation to delete a task
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: unappendSubTask } = useUnappendSubtask();

  return (
    <div>
      <Tooltip title="options">
        <IconButton
          size="small"
          id="demo-positioned-button"
          aria-controls={open ? "demo-positioned-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <MoreVertIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
      <Menu
        id="task-menu"
        aria-labelledby="task-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Tooltip
          title="Delete task permanently"
          placement="right-start"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 1000 }}
        >
          <MenuItem
            onClick={() => {
              deleteTask({
                boardId: panelItem.board_id,
                panelId: panelItem.id,
                taskId: task.id,
              });
              handleClose();
            }}
          >
            <DeleteForeverIcon sx={{ fontSize: "20px", marginRight: 1 }} />
            <Typography variant="body2">Delete</Typography>
          </MenuItem>
        </Tooltip>
        {task.parentTaskId && !task.is_completed && (
          <Tooltip
            title="Move out of sub tasks"
            placement="right-start"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 1000 }}
          >
            <MenuItem
              onClick={() => {
                // Find index of parent task in the panel
                const { parentTaskId } = task;
                const parentTaskIndex = panelItem.Task.findIndex(
                  (task) => task.id === parentTaskId
                );

                const parentTask = panelItem.Task[parentTaskIndex];
                const nextTask = panelItem.Task.filter(
                  (task) => task.parentTaskId === null
                )[parentTaskIndex + 1];

                const newTaskOrder = nextTask
                  ? Math.floor((parentTask!.order + nextTask.order) / 2)
                  : parentTask!.order + 100;

                unappendSubTask({
                  boardId: panelItem.board_id,
                  panelId: panelItem.id,
                  taskId: task.id,
                  parentTaskId: task.parentTaskId!,
                  order: newTaskOrder,
                });

                handleClose();
              }}
            >
              <SubdirectoryArrowLeftIcon
                sx={{ fontSize: "20px", marginRight: 1 }}
              />
              <Typography variant="body2">Un-append</Typography>
            </MenuItem>
          </Tooltip>
        )}
        <MenuItem onClick={handleClose}>
          <ClearIcon sx={{ fontSize: "20px", marginRight: 1 }} />
          <Typography variant="body2">Close</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};
