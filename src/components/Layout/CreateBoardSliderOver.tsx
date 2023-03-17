import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  LinkIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import useCreateBoard from "@/utils/mutations/useCreateBoard";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import { useToastContext } from "@/utils/context/ToastContext";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

const team = [
  {
    name: "Tom Cook",
    email: "tom.cook@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Whitney Francis",
    email: "whitney.francis@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Leonard Krasner",
    email: "leonard.krasner@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Floyd Miles",
    email: "floyd.miles@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Emily Selman",
    email: "emily.selman@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

interface CreateBoardSliderOverProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
const CreateBoardSlideOver: React.FC<CreateBoardSliderOverProps> = ({
  open,
  setOpen,
}) => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const addToast = useToastContext();

  // Get all unorganized boards for the user
  const { data: boardsWithoutFolderData } =
    api.board.getUserBoardWithoutFolder.useQuery(
      {
        userId: sessionData?.user.id ?? "",
      },
      {
        enabled: !!sessionData && sessionData.user.id !== undefined,
      }
    );

  //Mutation to create a new board
  const { mutateAsync: createBoard } = useCreateBoard();

  const [newBoardForm, setNewBoardForm] = useState({
    id: nanoid(),
    name: "",
    description: "",
    folderId: "",
    privacy: "PRIVATE",
    backgroundImage: null,
    thumbnailImage: "📝",
    collaborators: [],
    teams: [],
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewBoardForm({
      ...newBoardForm,
      [name]: value,
    });
  };

  console.log(newBoardForm);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            New Board
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-indigo-300">
                            Get started by filling in the information below to
                            create your new board.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pt-6 pb-5">
                            <div>
                              <label
                                htmlFor="project-name"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Board title{" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="name"
                                  id="board-name"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={newBoardForm.name}
                                  onChange={handleFormChange}
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="description"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Description
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="board-description"
                                  name="description"
                                  rows={4}
                                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                                  value={newBoardForm.description}
                                  onChange={handleFormChange}
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium leading-6 text-gray-900">
                                Team Members
                              </h3>
                              <div className="mt-2">
                                <div className="flex space-x-2">
                                  {team.map((person) => (
                                    <a
                                      key={person.email}
                                      href={person.href}
                                      className="rounded-full hover:opacity-75"
                                    >
                                      <img
                                        className="inline-block h-8 w-8 rounded-full"
                                        src={person.imageUrl}
                                        alt={person.name}
                                      />
                                    </a>
                                  ))}
                                  <button
                                    type="button"
                                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                  >
                                    <span className="sr-only">
                                      Add team member
                                    </span>
                                    <PlusIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <fieldset>
                              <legend className="text-sm font-medium leading-6 text-gray-900">
                                Privacy
                              </legend>
                              <div className="mt-2 space-y-4">
                                {/* Private to you */}
                                <div>
                                  <div className="relative flex items-start">
                                    <div className="absolute flex h-6 items-center">
                                      <input
                                        id="privacy-private"
                                        name="privacy"
                                        aria-describedby="privacy-private-to-project-description"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        value="PRIVATE"
                                        checked={
                                          newBoardForm.privacy === "PRIVATE"
                                        }
                                        onChange={handleFormChange}
                                      />
                                    </div>
                                    <div className="pl-7 text-sm leading-6">
                                      <label
                                        htmlFor="privacy-private"
                                        className="font-medium text-gray-900"
                                      >
                                        Private to you
                                      </label>
                                      <p
                                        id="privacy-private-description"
                                        className="text-gray-500"
                                      >
                                        You are the only one able to access this
                                        project.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Private to team */}
                                <div>
                                  <div className="relative flex items-start">
                                    <div className="absolute flex h-6 items-center">
                                      <input
                                        id="privacy-private-to-project"
                                        name="privacy"
                                        aria-describedby="privacy-private-to-project-description"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        value="TEAM"
                                        checked={
                                          newBoardForm.privacy === "TEAM"
                                        }
                                        onChange={handleFormChange}
                                      />
                                    </div>
                                    <div className="pl-7 text-sm leading-6">
                                      <label
                                        htmlFor="privacy-private-to-project"
                                        className="font-medium text-gray-900"
                                      >
                                        Private to team members
                                      </label>
                                      <p
                                        id="privacy-private-to-project-description"
                                        className="text-gray-500"
                                      >
                                        Only members of of selected teams would
                                        be able to access. You can select teams
                                        below.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Public */}
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-6 items-center">
                                    <input
                                      id="privacy-public"
                                      name="privacy"
                                      aria-describedby="privacy-public-description"
                                      type="radio"
                                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                      value="PUBLIC"
                                      checked={
                                        newBoardForm.privacy === "PUBLIC"
                                      }
                                      onChange={handleFormChange}
                                    />
                                  </div>
                                  <div className="pl-7 text-sm leading-6">
                                    <label
                                      htmlFor="privacy-public"
                                      className="font-medium text-gray-900"
                                    >
                                      Public access
                                    </label>
                                    <p
                                      id="privacy-public-description"
                                      className="text-gray-500"
                                    >
                                      Everyone with the link will see this
                                      project.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                          </div>
                          <div className="pt-4 pb-6">
                            <div className="flex text-sm">
                              <a
                                href="#"
                                className="group inline-flex items-center font-medium text-indigo-600 hover:text-indigo-900"
                                onClick={() => {
                                  // Copy the link to the clipboard
                                  void navigator.clipboard
                                    .writeText(
                                      `https://taskmate-webapp.vercel.app/board/${newBoardForm.id}`
                                    )
                                    .then(() => {
                                      // Show a toast notification
                                      addToast({
                                        icon: ClipboardDocumentCheckIcon,
                                        title: "Link copied to clipboard",
                                        description:
                                          "You can now share the link with your anyone after you have created the board.",
                                        position: "start",
                                      });
                                    })
                                    .catch((err) => console.log(err));
                                }}
                              >
                                <LinkIcon
                                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-900"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">Copy link</span>
                              </a>
                            </div>
                            <div className="mt-4 flex text-sm">
                              <a
                                href="#"
                                className="group inline-flex items-center text-gray-500 hover:text-gray-900"
                              >
                                <QuestionMarkCircleIcon
                                  className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">
                                  Learn more about sharing
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          void createBoard({
                            boardId: nanoid(),
                            userId: sessionData?.user.id ?? "",
                            currentBoardOrder:
                              boardsWithoutFolderData?.boardOrder ?? [],
                            title: "New Board",
                          }).then(
                            (board) =>
                              // Once board is created, redirect to the board page and open the toast
                              void router
                                .push(`/board/${board.id}`)
                                .then(() => {
                                  setTimeout(
                                    () =>
                                      addToast({
                                        title: "Board Created",
                                        description:
                                          "Start adding panels and tasks to your board!",
                                        icon: CheckCircleIcon,
                                      }),
                                    300
                                  );
                                })
                                .catch((err) => console.log(err))
                          );
                          setOpen(false);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CreateBoardSlideOver;
