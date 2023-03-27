/* DONE BY: Ding RuoQian 2100971 */

import { Moment } from "moment";

// Type definition for a new entry to be added to the todo list
// A new entry is a collection of content that is to be turned into a task
export type EntryType = {
  readonly todoMessage: string;
  readonly todoDateTime: Moment | null;
  readonly todoDescription: string;
};

// Type definition for a task
// A task is a collection of content
export type TaskType = {
  id: string;
  parent: string | null;
  title: string;
  date: string;
  time: string;
  description: string;
  subtasks: string[];
  isCompleted: boolean;
};

// Type definition for a list of tasks
// A list of tasks is a collection of tasks
export type TasksType = {
  [key: string]: TaskType;
};

// Type definition for a panel
// A panel is a collection of tasks
export type PanelType = {
  id: string;
  title: string;
  active: string[];
  completed: string[];
};

// Type definition for a list of panels
// A list of panels is a collection of panels
export type PanelsType = {
  [key: string]: PanelType;
};

// Type definition for the board
// A board is a collection of panels
export type BoardType = {
  todoTasks: TasksType;
  panels: PanelsType;
  panelOrder: string[];
};
