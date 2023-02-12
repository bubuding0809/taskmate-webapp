import { Typography } from "@mui/material";
import { AntSwitch } from "../custom/AntSwitch";
import TaskIcon from "@mui/icons-material/Task";
import BorderLinearProgress from "../custom/BorderedLinearProgress";

interface TodoPanelDividerProps {
  activeCount: number;
  completedCount: number;
  isReveal: boolean;
  handleReveal: React.ChangeEventHandler<HTMLInputElement>;
}

export const TodoPanelDivider: React.FC<TodoPanelDividerProps> = ({
  activeCount,
  completedCount,
  isReveal,
  handleReveal,
}: TodoPanelDividerProps) => {
  const progressValue =
    activeCount + completedCount
      ? (completedCount / (activeCount + completedCount)) * 100
      : 0;
  return (
    <div
      className={`
            flex h-10 items-center justify-between gap-2 bg-[#55605F] p-3 text-white
            ${!isReveal ? "rounded-b" : ""}
          `}
    >
      <TaskIcon />
      <BorderLinearProgress
        sx={{
          width: "100%",
          height: 18,
          border: "2px solid #f7f7f7",
          borderRadius: 4,
        }}
        variant="determinate"
        value={progressValue}
      />
      <Typography
        variant="body2"
        sx={{
          width: "min-content",
          whiteSpace: "nowrap",
        }}
      >
        {`${completedCount}/${activeCount + completedCount}`}
      </Typography>
      <AntSwitch onChange={handleReveal} checked={isReveal} />
    </div>
  );
};
