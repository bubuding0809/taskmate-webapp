import { useEffect, useRef, ChangeEventHandler } from "react";
import autoAnimate from "@formkit/auto-animate";
import {
  Fab,
  TextField,
  Chip,
  ButtonGroup,
  Button,
  TextareaAutosize,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { FlagCircle } from "@mui/icons-material";
import { Entry } from "../utils/types";
import { Moment } from "moment";

interface NewEntryConfigProps {
  newEntry: Entry;
  setNewEntry: React.Dispatch<React.SetStateAction<Entry>>;
  handleEntryChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  isOpenDateTime: boolean;
  setIsOpenDateTime: React.Dispatch<React.SetStateAction<boolean>>;
  isRevealDescription: boolean;
  setIsRevealDescription: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewEntryConfig: React.FC<NewEntryConfigProps> = ({
  newEntry,
  setNewEntry,
  handleEntryChange,
  isOpenDateTime,
  setIsOpenDateTime,
  isRevealDescription,
  setIsRevealDescription,
}: NewEntryConfigProps) => {
  // Set up autoAnimation for div parent
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const handleEntryDateTimeChange = (value: Moment | null) => {
    setNewEntry(prevState => ({
      ...prevState,
      todoDateTime: value,
    }));
  };

  const handleEntryDateTimeDelete = () => {
    setNewEntry(prevState => ({
      ...prevState,
      todoDateTime: null,
    }));
  };

  return (
    <div ref={parent} className="flex flex-col mt-2 gap-1">
      {/* Description field */}
      {isRevealDescription && (
        <TextareaAutosize
          className="p-3 bg-transparent focus:outline-none resize-none focus:resize-none"
          placeholder="Description..."
          name="todoDescription"
          value={newEntry.todoDescription}
          onChange={handleEntryChange}
        />
      )}

      {/* Date time chip */}
      {newEntry.todoDateTime && (
        <Chip
          sx={{
            alignSelf: "flex-start",
            color: "text.secondary",
          }}
          variant="outlined"
          size="small"
          label={newEntry.todoDateTime.format("ddd, D MMM, h:mm a")}
          onDelete={handleEntryDateTimeDelete}
        />
      )}

      <div className="flex justify-between items-center">
        {/* datetime picker */}
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <MobileDateTimePicker
            label="Set a deadline"
            value={newEntry.todoDateTime}
            onChange={handleEntryDateTimeChange}
            renderInput={params => (
              <TextField
                sx={{
                  display: "none",
                }}
                {...params}
              />
            )}
            open={isOpenDateTime}
            onAccept={() => setIsOpenDateTime(false)}
            onClose={() => setIsOpenDateTime(false)}
          />
        </LocalizationProvider>

        {/* config button group */}
        <div>
          <ButtonGroup variant="text" size="small" color="success">
            <Button
              sx={{
                color: "#9cb380",
                ":hover": {
                  color: "#3A5A40",
                },
              }}
              onClick={() => setIsOpenDateTime(true)}
            >
              <CalendarMonthIcon
                sx={{
                  fontSize: "20px",
                }}
              />
            </Button>
            <Button
              sx={{
                color: "#9cb380",
                ":hover": {
                  color: "#3A5A40",
                },
              }}
              onClick={() => setIsRevealDescription(prevState => !prevState)}
            >
              <DescriptionIcon
                sx={{
                  fontSize: "20px",
                }}
              />
            </Button>
            <Button
              sx={{
                color: "#9cb380",
                ":hover": {
                  color: "#3A5A40",
                },
              }}
            >
              <FlagCircle
                sx={{
                  fontSize: "20px",
                }}
              />
            </Button>
          </ButtonGroup>
        </div>

        {/* Save entry button */}
        <Fab
          sx={{
            color: "#f7f7f7",
            backgroundColor: "#9cb380",
            ":hover": {
              backgroundColor: "#3A5A40",
            },
          }}
          size="small"
          aria-label="add"
          type="submit"
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};
