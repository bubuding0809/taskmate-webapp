import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, Tooltip, Typography, Fade } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ClearIcon from "@mui/icons-material/Clear";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import { BoardType, PanelType, TaskType, Todo } from "../utils/types";

interface TodoTaskMenuProps {
  task: TaskType;
  panelData: PanelType;
  boardData: BoardType;
  handleDelete: any;
  handleUnappend: any;
}

export const TodoTaskMenu: React.FC<TodoTaskMenuProps> = ({
  task,
  panelData,
  boardData,
  handleDelete,
  handleUnappend,
}: TodoTaskMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
        {(!task.parent || !boardData.todoTasks[task.parent]!.isCompleted) && (
          <Tooltip
            title="Delete task permanently"
            placement="right-start"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 1000 }}
          >
            <MenuItem
              onClick={() => {
                handleDelete(task.id, panelData.id);
                handleClose();
              }}
            >
              <DeleteForeverIcon sx={{ fontSize: "20px", marginRight: 1 }} />
              <Typography variant="body2">Delete</Typography>
            </MenuItem>
          </Tooltip>
        )}
        {task.parent && !task.isCompleted && (
          <Tooltip
            title="Move out of sub tasks"
            placement="right-start"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 1000 }}
          >
            <MenuItem
              onClick={() => {
                handleUnappend(task.id, panelData.id);
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
