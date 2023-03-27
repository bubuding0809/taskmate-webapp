/* DONE BY: Ding RuoQian 2100971 */

import {
  Dispatch,
  Fragment,
  MouseEventHandler,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { Combobox, Popover, Transition } from "@headlessui/react";
import { UsersIcon } from "@heroicons/react/20/solid";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/utils/helper";
import { api } from "@/utils/api";
import { Board, Board_Collaborator, Panel, Task, User } from "@prisma/client";
import useDebouceQuery from "@/utils/hooks/useDebounceQuery";
import { useSession } from "next-auth/react";
import useAddCollaborators from "@/utils/mutations/collaborator/useAddCollaborators";

interface UserSearchPopoverProps {
  setPopOverOpen?: Dispatch<SetStateAction<boolean>>;
  newBoardForm?: {
    id: string;
    title: string;
    description: string;
    folderId: string;
    privacy: "PRIVATE" | "PUBLIC" | "TEAM";
    backgroundImage: string | null;
    thumbnailImage: string | null;
    collaborators: User[];
    teams: string[];
  };
  setNewBoardForm?: Dispatch<
    SetStateAction<{
      id: string;
      title: string;
      description: string;
      folderId: string;
      privacy: "PRIVATE" | "PUBLIC" | "TEAM";
      backgroundImage: string | null;
      thumbnailImage: string | null;
      collaborators: User[];
      teams: string[];
    }>
  >;
  bid?: string;
}

const MAX_COLLABORATORS = 10;

const UserSearchPopover: React.FC<UserSearchPopoverProps> = ({
  newBoardForm,
  setNewBoardForm,
  setPopOverOpen,
  bid,
}) => {
  const { data: sessionData } = useSession();
  const [query, setQuery, debouncedQuery] = useDebouceQuery("", 200);

  // Query to get users by name or email
  const { data: usersData } = api.user.getUsersByNameOrEmail.useQuery(
    {
      query: debouncedQuery,
    },
    { enabled: debouncedQuery !== "" }
  );

  // Query to get board data
  const { data: boardQueryData } = api.board.getBoardById.useQuery(
    {
      boardId: bid ?? "",
    },
    {
      enabled: !!bid,
    }
  );

  // Mutation to add selected users to the board collaborator list
  const { mutateAsync: addCollaborators, isLoading: isAddingUsers } =
    useAddCollaborators();

  // State for selected users that will be added to the collaborator list
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Filter out users that are already in the collaborator list and the current user
  const filteredUsersData = useMemo(() => {
    if (!usersData) return [];

    // Filter out users that are already in the collaborator list and the current user
    return usersData.filter(
      (user) =>
        !(
          newBoardForm?.collaborators ??
          boardQueryData?.Board_Collaborator.map((c) => c.User) ??
          []
        ).some((collaborator) => collaborator.id === user.id) &&
        user.id !== sessionData?.user.id
    );
  }, [
    usersData,
    sessionData,
    newBoardForm?.collaborators ?? boardQueryData?.Board_Collaborator ?? [],
  ]);

  // Call back function to add selected users to the collaborator list
  const handleAddSelectedUsers = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<undefined> => {
    e.preventDefault();
    e.stopPropagation();

    // Add selected users to the collaborator list, prevent duplicates
    if (!selectedUsers.length) return;

    // If the popover is used in the new board form, add the selected users to the new board form state
    if (setNewBoardForm) {
      setNewBoardForm((prev) => {
        // Get the IDs of the current users
        const currentUsers = prev.collaborators.map((user) => user.id);

        // Get the IDs of the new users to be added, filter out duplicates that are already in current users
        const newUsers = selectedUsers.filter(
          (user) => user && !currentUsers.includes(user.id)
        );

        // Make sure the total number of collaborators doesn't exceed 10
        if (currentUsers.length + newUsers.length > MAX_COLLABORATORS) {
          alert(`You can't have more than ${MAX_COLLABORATORS} collaborators.`);
          return prev;
        }

        // Add the new users to the collaborator list
        return {
          ...prev,
          collaborators: [...prev.collaborators, ...newUsers],
        };
      });
    }
    // If the popover is used in the board settings, add the selected users to the board collaborator list
    else {
      // Add selected users to the collaborator list, prevent duplicates
      const currentCollaborators =
        boardQueryData?.Board_Collaborator.map((c) => c.User.id) ?? [];

      const newCollaborators = selectedUsers.filter(
        (user) => user && !currentCollaborators.includes(user.id)
      );

      // Make sure the total number of collaborators doesn't exceed 10
      if (
        currentCollaborators.length + newCollaborators.length >
        MAX_COLLABORATORS
      ) {
        alert(`You can't have more than ${MAX_COLLABORATORS} collaborators.`);
        return;
      }

      await addCollaborators({
        boardId: bid ?? "",
        userIds: newCollaborators.map((user) => user.id),
      });
    }

    // Clear the selected users
    setSelectedUsers([]);
  };

  return (
    <Popover className="relative h-8">
      <Popover.Button
        type="button"
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span className="sr-only">Add team member</span>
        <PlusIcon className="h-5 w-5" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute -left-8 z-10 mt-2 flex w-screen max-w-max px-4">
          {({ close, open }) => {
            setPopOverOpen && setPopOverOpen(open);
            return (
              <div className="max-w-[26rem] flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
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
                    <div className="relative">
                      <Combobox.Input
                        autoFocus
                        className="w-full rounded-md border border-gray-300 px-4 py-2.5 indent-5 text-gray-900 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 sm:text-sm"
                        placeholder="Search for collaborators"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={() => query}
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <Combobox.Options
                      static
                      className="mt-2 flex max-h-96 w-96 scroll-py-3 flex-col overflow-y-auto"
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

                    {query !== "" && filteredUsersData?.length === 0 && (
                      <div className="py-14 px-4 text-center sm:px-14">
                        <UsersIcon
                          className="mx-auto h-6 w-6 text-gray-400"
                          aria-hidden="true"
                        />
                        <p className="mt-4 text-sm text-gray-900">
                          No people found using that search term.
                        </p>
                      </div>
                    )}

                    {!query.length && !filteredUsersData.length && (
                      <div className="py-14 px-4 text-center sm:px-14">
                        <MagnifyingGlassIcon
                          className="mx-auto h-6 w-6 text-gray-400"
                          aria-hidden="true"
                        />
                        <p className="mt-4 text-sm text-gray-900">
                          Search for people by name or email.
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
                    disabled={isAddingUsers}
                    className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100 disabled:bg-indigo-300 disabled:text-white"
                    onClick={(e) =>
                      void handleAddSelectedUsers(e)
                        .then(() => close())
                        .catch((err) => console.log(err))
                    }
                  >
                    {isAddingUsers ? (
                      <>
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline h-4 w-4 animate-spin"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="#1C64F2"
                          />
                        </svg>
                        Adding users...
                      </>
                    ) : (
                      <>
                        <PlusIcon
                          className="h-5 w-5 flex-none text-gray-400"
                          aria-hidden="true"
                        />
                        Invite selected people
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

export default UserSearchPopover;
