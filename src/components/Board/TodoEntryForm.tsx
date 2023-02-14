import {
  useState,
  useEffect,
  useRef,
  FormEventHandler,
  ChangeEventHandler,
  ChangeEvent,
} from "react";
import autoAnimate from "@formkit/auto-animate";
import { Paper, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ClickAwayListener } from "@mui/base";
import { EntryType } from "../../utils/types";
import { NewEntryConfig } from "./TodoEntryFormConfig";

interface TodoEntryFormProps {
  handleNewEntry: FormEventHandler<HTMLFormElement>;
  newEntry: EntryType;
  setNewEntry: React.Dispatch<React.SetStateAction<EntryType>>;
}

const StyledTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#35605A",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#35605A",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#35605A",
    },
    "&:hover fieldset": {
      borderColor: "#35605A",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#35605A",
    },
  },
});

export const TodoEntryForm: React.FC<TodoEntryFormProps> = ({
  handleNewEntry,
  newEntry,
  setNewEntry,
}: TodoEntryFormProps) => {
  const [isRevealConfig, setIsRevealConfig] = useState<boolean>(false);
  const [isRevealDescription, setIsRevealDescription] =
    useState<boolean>(false);
  const [isOpenDateTime, setIsOpenDateTime] = useState<boolean>(false);

  // Set up autoAnimation for div and form elements
  const parent = useRef(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const handleEntryChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setNewEntry((prevState) => ({
      ...prevState,
      [name]: e.target.value,
    }));
  };

  return (
    <ClickAwayListener onClickAway={() => setIsRevealConfig(false)}>
      <Paper elevation={2}>
        <form
          ref={parent}
          onSubmit={handleNewEntry}
          className="w-full px-2 pb-2 pt-1"
        >
          {/* New entry message */}
          <StyledTextField
            sx={{
              paddingX: "3px",
              textIndent: "0.5rem",
              width: "100%",
            }}
            color="success"
            variant="standard"
            name="todoMessage"
            label="New task"
            value={newEntry.todoMessage}
            onChange={handleEntryChange}
            onFocus={() => setIsRevealConfig(true)}
          />

          {/* New entry config */}
          {isRevealConfig && (
            <NewEntryConfig
              newEntry={newEntry}
              setNewEntry={setNewEntry}
              handleEntryChange={handleEntryChange}
              isOpenDateTime={isOpenDateTime}
              setIsOpenDateTime={setIsOpenDateTime}
              isRevealDescription={isRevealDescription}
              setIsRevealDescription={setIsRevealDescription}
            />
          )}
        </form>
      </Paper>
    </ClickAwayListener>
  );
};
