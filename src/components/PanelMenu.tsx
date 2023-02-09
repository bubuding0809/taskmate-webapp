import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, Tooltip, Typography, Fade, Button } from "@mui/material";
import { Clear, Delete } from "@mui/icons-material";
import { BoardType, PanelType } from "../utils/types";
import { MoreHoriz } from "@mui/icons-material";

interface PanelMenuProps {
  panelData: PanelType;
  boardData: BoardType;
  handleDelete: any;
}

export const PanelMenu = ({
  panelData,
  boardData,
  handleDelete,
}: PanelMenuProps) => {
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
      <Tooltip title="Edit panel">
        <Button
          sx={{
            padding: "0",
            borderRadius: "4px",
            minWidth: "30px",
            maxWidth: "30px",
            minHeight: "30px",
            maxHeight: "30px",
          }}
          id="demo-positioned-button"
          aria-controls={open ? "demo-positioned-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <MoreHoriz fontSize="medium" color="action" />
        </Button>
      </Tooltip>
      <Menu
        id="panel-menu"
        aria-labelledby="panel-menu"
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
        <MenuItem
          onClick={() => {
            handleDelete(panelData.id);
            handleClose();
          }}
        >
          <Delete sx={{ fontSize: "20px", marginRight: 1 }} />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Clear sx={{ fontSize: "20px", marginRight: 1 }} />
          <Typography variant="body2">Close</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};
