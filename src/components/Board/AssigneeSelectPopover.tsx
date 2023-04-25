/* DONE BY: Ding RuoQian 2100971 */

import { Dispatch, Fragment, SetStateAction, useMemo, useState } from "react";
import { Combobox, Popover, Transition } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils/helper";
import { api } from "@/utils/api";
import Spinner from "../custom/Spinner";
import useAddAssignees from "@/utils/mutations/task/useAddAssignees";

import type { User } from "@prisma/client";
import type { Optional } from "@/utils/types";
import type { RouterOutputs } from "@/utils/api";

type ExtractPanel<T> = T extends { Panel: infer U } ? U : never;
type Panel = ExtractPanel<RouterOutputs["board"]["getBoardById"]>[number];
type Task = Optional<Panel["Task"][number], "subtasks">;

interface UserSearchPopoverProps {
  setPopOverOpen?: Dispatch<SetStateAction<boolean>>;
  newTaskForm?: {
    task_title: string;
    task_description: string;
    task_start_dt: string;
    task_end_dt: string;
    task_due_dt: string;
    task_assignedUsers: User[];
  };
  setNewTaskForm?: React.Dispatch<
    React.SetStateAction<{
      task_title: string;
      task_description: string;
      task_start_dt: string;
      task_end_dt: string;
      task_due_dt: string;
      task_assignedUsers: User[];
    }>
  >;
  bid: string;
  task?: Task;
  innerClassName?: string;
  PopoverButton?: React.FC;
}

// Maximum number of collaborators allowed
const MAX_COLLABORATORS = 5;

const AssigneeSelectPopover: React.FC<UserSearchPopoverProps> = ({
  newTaskForm,
  setNewTaskForm,
  setPopOverOpen,
  bid,
  task,
  innerClassName,
  PopoverButton = DefaultPopoverButton,
}) => {
  // Query to get board data
  const { data: boardQueryData } = api.board.getBoardById.useQuery({
    boardId: bid,
  });

  // State for selected users that will be added to the collaborator list
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Mutation to add assignees to the task
  const { mutateAsync: addAssignees, isLoading: addAssigneesLoading } =
    useAddAssignees();

  // Filter out users that are already in the collaborator list and the current user
  const filteredUsersData = useMemo(() => {
    if (!boardQueryData) return [];

    // Get the list of users that are already in the collaborator list
    const availableUsers = boardQueryData.Board_Collaborator.map(
      (collaborator) => collaborator.User
    );

    // Include the current user
    availableUsers.push(boardQueryData.user);

    // Filter out users that are already being assigned to the task
    return availableUsers.filter((user) => {
      // If the task is being created, check if the user is already in the new task form
      if (newTaskForm) {
        return !newTaskForm.task_assignedUsers.some(
          (collaborator) => collaborator.id === user.id
        );
      }

      // If the task is being edited, check if the user is already assigned to the task
      return !task!.Task_Assign_Rel.some(
        (assigned) => assigned.user_id === user.id
      );
    });
  }, [newTaskForm, boardQueryData, task]);

  // Call back function to add selected users to the collaborator list
  const handleAddSelectedUsers = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (setNewTaskForm) {
      setNewTaskForm((prev) => {
        // Get the IDs of the current users
        const currentUsers = prev.task_assignedUsers.map((user) => user.id);

        // Get the IDs of the new users to be added, filter out duplicates that are already in current users
        const newUsers = selectedUsers.filter(
          (user) => user && !currentUsers.includes(user.id)
        );

        // Make sure the total number of collaborators doesn't exceed 10
        if (currentUsers.length + newUsers.length > MAX_COLLABORATORS) {
          alert(`You can't have more than ${MAX_COLLABORATORS} assignees.`);
          return prev;
        }

        // Add the new users to the collaborator list
        return {
          ...prev,
          task_assignedUsers: [...prev.task_assignedUsers, ...newUsers],
        };
      });
    } else {
      // Add the new users to the task
      await addAssignees({
        boardId: bid,
        panelId: task!.panel_id,
        taskId: task!.id,
        assigneeIds: selectedUsers.map((user) => user.id),
      });
    }

    // Clear the selected users
    setSelectedUsers([]);
  };

  return (
    <Popover className="relative h-8">
      <PopoverButton />
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          className={classNames(
            innerClassName ?? "",
            "z-10 flex w-screen max-w-max px-4"
          )}
        >
          {({ close, open }) => {
            setPopOverOpen && setPopOverOpen(open);
            return (
              <div className="z-10 max-w-[26rem] flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                {/* Popover body */}
                <div className="p-4">
                  <Combobox
                    value={selectedUsers}
                    onChange={(person) => {
                      setSelectedUsers(person);
                    }}
                    by={(userA, userB) => userA.id === userB.id}
                    multiple
                  >
                    <Combobox.Options
                      static
                      className="mt-2 flex max-h-52 w-96 scroll-py-3 flex-col overflow-y-auto"
                    >
                      {filteredUsersData?.map((user) => (
                        <Combobox.Option
                          key={user.id}
                          value={user}
                          className={({ active }) =>
                            classNames(
                              "flex cursor-default select-none rounded-xl p-3",
                              active && "bg-gray-100"
                            )
                          }
                        >
                          {({ active, selected }) => (
                            <>
                              <div
                                className={classNames(
                                  "flex h-10 w-10 flex-none items-center justify-center rounded-lg"
                                )}
                              >
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.image ?? ""}
                                  alt={user.name ?? ""}
                                />
                              </div>
                              <div className="ml-4 flex-auto">
                                <p
                                  className={classNames(
                                    "text-sm font-medium",
                                    active ? "text-gray-900" : "text-gray-700"
                                  )}
                                >
                                  {user.name}
                                </p>
                                <p
                                  className={classNames(
                                    "text-sm",
                                    active ? "text-gray-700" : "text-gray-500"
                                  )}
                                >
                                  {user.email}
                                </p>
                              </div>
                              <div className="ml-3 flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                  checked={selected}
                                  readOnly
                                />
                              </div>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>

                    {!filteredUsersData.length && (
                      <div className="py-14 px-4 text-center sm:px-14">
                        <p className="mt-4 text-sm text-gray-900">
                          All collaborators have been assigned
                        </p>
                      </div>
                    )}
                  </Combobox>

                  {/* Render selected people names */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedUsers.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1"
                      >
                        <img
                          className="h-6 w-6 rounded-full"
                          src={person.image ?? ""}
                          alt={person.name ?? ""}
                        />
                        <span>{person.name}</span>

                        {/* X button to remove user from selected */}
                        <button
                          type="button"
                          className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => {
                            setSelectedUsers((prev) =>
                              prev.filter((user) => user.id !== person.id)
                            );
                          }}
                        >
                          <span className="sr-only">Remove {person.name}</span>
                          <XMarkIcon className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popover footer */}
                <div className="grid grid-cols-1 divide-x divide-gray-900/5 bg-gray-50">
                  <button
                    disabled={addAssigneesLoading}
                    className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100 disabled:bg-indigo-300 disabled:text-white"
                    onClick={(e) =>
                      void handleAddSelectedUsers(e).then(() => close())
                    }
                  >
                    {addAssigneesLoading ? (
                      <>
                        <Spinner />
                        Assigning
                      </>
                    ) : (
                      <>
                        <PlusIcon
                          className="h-5 w-5 flex-none text-gray-400"
                          aria-hidden="true"
                        />
                        Assign selected
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          }}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default AssigneeSelectPopover;

const DefaultPopoverButton: React.FC = () => {
  return (
    <Popover.Button
      type="button"
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <span className="sr-only">Add team member</span>
      <PlusIcon className="h-5 w-5" aria-hidden="true" />
    </Popover.Button>
  );
};
