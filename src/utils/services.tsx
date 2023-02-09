export const createNewTask = (
  id: string,
  title: string,
  description: string,
  date: string,
  time: string
) => {
  return {
    id,
    title,
    description,
    date,
    time,
    subtasks: [],
    isCompleted: false,
    isTopLevel: true,
  };
};
