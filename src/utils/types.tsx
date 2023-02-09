import { Moment } from "moment";

export type Todo = {
  readonly id: string;
  readonly message: string;
  readonly date: string | null;
  readonly time: string | null;
  readonly description: string | null;
  readonly subTasks: Todo[];
  readonly isTopLevelItem: boolean;
  readonly isChecked: boolean;
};

export type Entry = {
  readonly todoMessage: string;
  readonly todoDateTime: Moment | null;
  readonly todoDescription: string;
};

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

export type TasksType = {
  [key: string]: TaskType;
};

export type PanelType = {
  id: string;
  title: string;
  active: string[];
  completed: string[];
};

export type PanelsType = {
  [key: string]: PanelType;
};

export type PanelOrderType = string[];

export type BoardType = {
  todoTasks: TasksType;
  panels: PanelsType;
  panelOrder: PanelOrderType;
};
