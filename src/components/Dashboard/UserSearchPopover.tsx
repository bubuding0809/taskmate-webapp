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
import { User } from "@prisma/client";
import useDebouceQuery from "@/utils/hooks/useDebounceQuery";
import { useSession } from "next-auth/react";

interface UserSearchPopoverProps {
  newBoardForm: {
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
  setNewBoardForm: Dispatch<
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
  setPopOverOpen: Dispatch<SetStateAction<boolean>>;
}

const UserSearchPopover: React.FC<UserSearchPopoverProps> = ({
  newBoardForm,
  setNewBoardForm,
  setPopOverOpen,
}) => {
  const { data: sessionData } = useSession();
  const [query, setQuery, debouncedQuery] = useDebouceQuery("", 200);
  const { data: usersData } = api.user.getUsersByNameOrEmail.useQuery(
    {
      query: debouncedQuery,
    },
    { enabled: debouncedQuery !== "" }
  );

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const filteredUsersData = useMemo(() => {
    if (!usersData) return [];

    // Filter out users that are already in the collaborator list and the current user
    return usersData.filter(
      (user) =>
        !newBoardForm.collaborators.some(
          (collaborator) => collaborator.id === user.id
        ) && user.id !== sessionData?.user.id
    );
  }, [usersData, sessionData, newBoardForm.collaborators]);

  // Call back function to add selected users to the collaborator list
  const handleAddSelectedUsers: MouseEventHandler<HTMLButtonElement> = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Add selected users to the collaborator list, prevent duplicates
    if (!selectedUsers.length) return;

    setNewBoardForm((prev) => {
      // Get the IDs of the current users
      const currentUsers = prev.collaborators.map((user) => user.id);

      // Get the IDs of the new users to be added, filter out duplicates that are already in current users
      const newUsers = selectedUsers.filter(
        (user) => user && !currentUsers.includes(user.id)
      );

      // Make sure the total number of collaborators doesn't exceed 10
      if (newBoardForm.collaborators.length + newUsers.length > 10) {
        alert("You can't add more than 10 collaborators.");
        return prev;
      }

      // Add the new users to the collaborator list
      return {
        ...prev,
        collaborators: [...prev.collaborators, ...newUsers],
      };
    });

    // Clear the selected users
    setSelectedUsers([]);
  };

  return (
    <Popover className="relative">
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
            setPopOverOpen(open);
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
                            <span className="sr-only">
                              Remove {person.name}
                            </span>
                            <XMarkIcon className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      ))}
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
                </div>

                {/* Popover footer */}
                <div className="grid grid-cols-1 divide-x divide-gray-900/5 bg-gray-50">
                  <button
                    className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={(e) => {
                      handleAddSelectedUsers(e);
                      close();
                    }}
                  >
                    <PlusIcon
                      className="h-5 w-5 flex-none text-gray-400"
                      aria-hidden="true"
                    />
                    Invite selected people
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
