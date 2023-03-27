/* DONE BY: Ding RuoQian 2100971 */

import * as React from "react";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface CircularProgressWithLabelProps {
  value: number;
}

const CircularProgressWithLabel: React.FC<
  CircularProgressProps & CircularProgressWithLabelProps
> = (props) => {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          fontSize="10px"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
