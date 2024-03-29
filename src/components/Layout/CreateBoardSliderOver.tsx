/* DONE BY: Ding RuoQian 2100971 */

import {
  ChangeEventHandler,
  Dispatch,
  FormEventHandler,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { LinkIcon } from "@heroicons/react/20/solid";
import useCreateBoard from "@/utils/mutations/useCreateBoard";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import { useToastContext } from "@/utils/context/ToastContext";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { User } from "@prisma/client";
import { Tooltip } from "@mui/material";
import UserSearchPopover from "../Dashboard/UserSearchPopover";
import { classNames } from "@/utils/helper";
import UserModal from "@/components/Modal/UserModal";
import Spinner from "@/components/custom/Spinner";

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

  // State to hold the form data
  const [newBoardForm, setNewBoardForm] = useState<{
    id: string;
    title: string;
    description: string;
    folderId: string;
    privacy: "PRIVATE" | "PUBLIC" | "TEAM";
    backgroundImage: string | null;
    thumbnailImage: string | null;
    collaborators: User[];
    teams: string[];
  }>({
    id: nanoid(),
    title: "",
    description: "",
    folderId: "",
    privacy: "PRIVATE",
    backgroundImage: null,
    thumbnailImage: "📝",
    collaborators: [],
    teams: [],
  });

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  // State for whether the board is being created
  const [isCreating, setIsCreating] = useState(false);

  const [popOverOpen, setPopOverOpen] = useState(false);

  // State to control if slide over can be closed
  const [canClose, setCanClose] = useState(false);

  // When the slide over opens, set a 300ms timeout to allow the slide over to open before allowing it to be closed.
  useEffect(() => {
    if (open) {
      setCanClose(false);
      setTimeout(() => {
        setCanClose(true);
      }, 300);
    }
  }, [open]);

  // Handle form change callback for controlled inputs
  const handleFormChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBoardForm({
      ...newBoardForm,
      [name]: value,
    });
  };

  // Handle form submit callback for creating a new board
  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Create the board
    setIsCreating(true);

    // Call the mutation to create the board
    void createBoard({
      boardId: newBoardForm.id,
      userId: sessionData?.user.id ?? "",
      currentBoardOrder: boardsWithoutFolderData?.boardOrder ?? [],
      title: newBoardForm.title,
      description: newBoardForm.description,
      collaborators: newBoardForm.collaborators.map((user) => user.id),
      privacy: newBoardForm.privacy,
    })
      .then((board) => {
        // On success close the slide over and reset the form
        setOpen(false);
        setNewBoardForm({
          id: nanoid(),
          title: "",
          description: "",
          folderId: "",
          privacy: "PRIVATE",
          backgroundImage: null,
          thumbnailImage: "📝",
          collaborators: [],
          teams: [],
        });

        // Once board is created, redirect to the board page and open the toast
        void router.push(`/board/${board.id}`).then(() => {
          // Open the toast after 300ms
          setTimeout(
            () =>
              addToast({
                title: "Board Created",
                description: "Start adding panels and tasks to your board!",
                icon: CheckCircleIcon,
              }),
            300
          );
        });
      })
      .catch(() => {
        addToast({
          title: "Error",
          description: "Something went wrong. Please try again later.",
          icon: XCircleIcon,
          position: "start",
        });
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => canClose && setOpen(false)}
      >
        {/* Backdrop */}
        <div className="fixed inset-0" />

        {/* Main */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md shadow-md">
                  <form
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    onSubmit={handleFormSubmit}
                  >
                    <div
                      className={classNames(
                        popOverOpen && "pb-14",
                        "flex-1 overflow-y-auto overflow-x-hidden"
                      )}
                    >
                      {/* Form header */}
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
                              tabIndex={-1}
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

                      {/* Form main */}
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
                                  autoFocus
                                  required
                                  type="text"
                                  name="title"
                                  id="board-name"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={newBoardForm.title}
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
                                Collaborators
                              </h3>
                              <div className="mt-2 flex space-x-2">
                                <div className="flex items-center gap-2">
                                  {newBoardForm.collaborators.map((user) => (
                                    <div key={user.id} className="relative">
                                      <Tooltip
                                        title={user.name}
                                        className="cursor-pointer rounded-full hover:opacity-75"
                                        onClick={() => {
                                          setCurrUser(user);
                                          setOpenUserModal(true);
                                        }}
                                      >
                                        <img
                                          // prevent images from being compressed
                                          className="h=[26px] inline-block w-[26px] rounded-full sm:h-8 sm:w-8"
                                          src={user.image ?? ""}
                                          alt={user.name ?? ""}
                                        />
                                      </Tooltip>

                                      {/* Remove button */}
                                      <button
                                        type="button"
                                        className="absolute -bottom-4 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:h-6 sm:w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setNewBoardForm({
                                            ...newBoardForm,
                                            collaborators:
                                              newBoardForm.collaborators.filter(
                                                (u) => u.id !== user.id
                                              ),
                                          });
                                        }}
                                      >
                                        <span className="sr-only">
                                          Remove {user.name}
                                        </span>
                                        <XMarkIcon
                                          className="h-3 w-3 sm:h-4 sm:w-4"
                                          aria-hidden="true"
                                        />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                {/* Maximum of 10 collaborators */}
                                {newBoardForm.collaborators.length < 10 && (
                                  <UserSearchPopover
                                    setNewBoardForm={setNewBoardForm}
                                    newBoardForm={newBoardForm}
                                    setPopOverOpen={setPopOverOpen}
                                  />
                                )}
                              </div>

                              {/* Only shown when collaborator avatar is clicked */}
                              <UserModal
                                open={openUserModal}
                                setOpen={setOpenUserModal}
                                user={currUser}
                              />
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
                        </div>
                      </div>
                    </div>

                    {/* Form footer */}
                    <div className="flex flex-shrink-0 justify-between px-4 py-4">
                      {/* Copy board link */}
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

                      {/* Button group */}
                      <div className="flex">
                        {/* Cancel button */}
                        <button
                          disabled={isCreating}
                          type="button"
                          className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-300 disabled:text-white"
                          onClick={() => {
                            setOpen(false);

                            // Reset the form
                            setNewBoardForm({
                              id: nanoid(),
                              title: "",
                              description: "",
                              folderId: "",
                              privacy: "PRIVATE",
                              backgroundImage: null,
                              thumbnailImage: "📝",
                              collaborators: [],
                              teams: [],
                            });
                          }}
                        >
                          Cancel
                        </button>

                        {/* Create button */}
                        <button
                          disabled={isCreating}
                          type="submit"
                          className="ml-4 inline-flex items-center justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600/50"
                        >
                          {isCreating ? (
                            <>
                              <Spinner />
                              Creating...
                            </>
                          ) : (
                            "Create"
                          )}
                        </button>
                      </div>
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
