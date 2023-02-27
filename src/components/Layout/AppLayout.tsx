import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  BellIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderPlusIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { classNames } from "../../utils/helper";
import FolderDisclosure from "../../components/Layout/FolderDisclosure";
import Head from "next/head";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/utils/api";
import Link from "next/link";
import useCreateFolder from "@/utils/mutations/useCreateFolder";
import { nanoid } from "nanoid";
import {
  DragDropContext,
  Draggable,
  DragStart,
  Droppable,
  DropResult,
  resetServerContext,
} from "react-beautiful-dnd";
import useUpdateFolderOrder from "@/utils/mutations/useUpdateFolderOrder";
import useUpdateBoardOrder from "@/utils/mutations/useUpdateBoardOrder";
import useAddBoardToFolder from "@/utils/mutations/useAddBoardToFolder";
import autoAnimate from "@formkit/auto-animate";
import useCreateBoard from "@/utils/mutations/useCreateBoard";
import BoardDisclosure from "./BoardDisclosure";
import useUpdateNestedBoardOrder from "@/utils/mutations/useUpdateNestedBoardOrder";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  { name: "Teams", href: "#", icon: UsersIcon, current: false },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
];

const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

type AppLayoutProps = {
  children?: ReactNode;
  title?: string;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  // Use resetServerContext to prevent react-beautiful-dnd from crashing
  resetServerContext();

  // Get session data
  const { data: sessionData, status: sessionStatus } = useSession({
    required: true,
  });

  // Get all folders for the user
  const { data: folderData } = api.folder.getAllUserFolders.useQuery(
    {
      userId: sessionData?.user.id ?? "",
    },
    {
      enabled: !!sessionData && sessionData.user.id !== undefined,
    }
  );

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

  // Mutation hooks
  const { mutate: createFolder } = useCreateFolder();
  const { mutate: reorderFolder } = useUpdateFolderOrder();
  const { mutate: addBoardToFolder } = useAddBoardToFolder();
  const { mutate: reorderBoard } = useUpdateBoardOrder();
  const { mutate: createBoard } = useCreateBoard();
  const { mutate: reorderNestedBoard } = useUpdateNestedBoardOrder();

  // Set up sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set up sidebar expand state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // state to handle drop enabled or disabled for folders and boards
  const [boardsDropDisabled, setBoardsDropDropDisabled] = useState(false);

  // Set up autoAnimation of folder boards element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // Return loading screen while session is loading
  if (sessionStatus === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Loading...</h1>
      </div>
    );
  }

  /* Drag and Drop handlers for Drag Drop Context */
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type, combine } = result;

    // Debugging console log
    console.log(
      "Drag end info: ",
      combine,
      source.droppableId,
      destination?.droppableId,
      type
    );

    // * Handle combining of board to a folder
    if (combine && source.droppableId === "boards") {
      const newBoardOrder = [...boardsWithoutFolderData!.boardOrder];

      // Remove the board from the old position
      newBoardOrder.splice(source.index, 1);

      addBoardToFolder({
        boardId: draggableId,
        folderId: combine.draggableId,
        userId: sessionData.user.id,
        boardOrder: newBoardOrder,
        folderBoardOrder:
          folderData?.folders.get(combine.draggableId)?.board_order ?? [],
      });

      return;
    }

    // * If there is no destination, return
    if (!destination) return;

    // * If draggable is dropped in the same location, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // * Handle reordering of a sidebar board
    if (
      source.droppableId === "boards" &&
      destination?.droppableId === "boards"
    ) {
      const newBoardOrder = [...boardsWithoutFolderData!.boardOrder];

      newBoardOrder.splice(source.index, 1);

      newBoardOrder.splice(destination.index, 0, draggableId);

      // Mutate the board order
      reorderBoard({
        boardOrder: newBoardOrder,
        userId: sessionData.user.id,
      });

      return;
    }

    // * Handle reordering of a sidebar folder
    if (
      source.droppableId === "folders" &&
      destination.droppableId === "folders"
    ) {
      const newFolderorder = [...folderData!.folderOrder];

      // Remove the folder from the old position
      newFolderorder.splice(source.index, 1);

      // Insert the folder to the new position
      newFolderorder.splice(destination.index, 0, draggableId);

      // Mutate the folder order
      reorderFolder({
        folderOrder: newFolderorder,
        userId: sessionData.user.id,
      });

      return;
    }

    // * Handle reordering of a nested folder board
    if (type === "nested-boards") {
      const _draggableId = draggableId.replace("nested-board-", "");
      // Get the new board order for the source folder and destination folder
      const newSourceBoardOrder = [
        ...folderData!.folders.get(source.droppableId)!.board_order,
      ];
      const newDestinationBoardOrder = [
        ...folderData!.folders.get(destination.droppableId)!.board_order,
      ];

      // Remove the board from the old position
      newSourceBoardOrder.splice(source.index, 1);
      // If the source folder and destination folder are the same, add the board to the new position in the source folder
      if (source.droppableId === destination.droppableId) {
        newSourceBoardOrder.splice(destination.index, 0, _draggableId);
      } else {
        // If the source folder and destination folder are different, add the board to the new position in the destination folder
        newDestinationBoardOrder.splice(destination.index, 0, _draggableId);
      }

      // Mutate the board order for the source folder and destination folder
      reorderNestedBoard({
        userId: sessionData.user.id,
        boardId: _draggableId,
        sourceFolderId: source.droppableId,
        destinationFolderId: destination.droppableId,
        sourceBoardOrder: newSourceBoardOrder,
        destinationBoardOrder: newDestinationBoardOrder,
        isSameFolder: source.droppableId === destination.droppableId,
      });
    }
  };

  const onDragStart = (initial: DragStart) => {
    const { source, type, draggableId } = initial;

    if (source.droppableId === "folders") {
      setBoardsDropDropDisabled(true);
    } else {
      setBoardsDropDropDisabled(false);
    }
  };

  // Only show the layout if the user is logged in
  return (
    <>
      <Head>
        <title>{title ?? "Taskmate page"}</title>
        <meta name="description" content="WCard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen w-screen overflow-x-auto">
        {/* Dynamic side bar for mobile, able to show and hide*/}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            {/* Overlay element */}
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            {/* Sidebar element */}
            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-gray-300"
                                : "text-gray-400 group-hover:text-gray-300",
                              "mr-4 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop, able to expand and retract */}
        <div
          className={classNames(
            sidebarExpanded ? "md:w-64" : "md:w-20",
            "hidden w-full transition-all ease-in-out md:relative md:inset-y-0 md:flex md:flex-col "
          )}
        >
          {/* Expand Sidebar button */}
          <button
            className={classNames(
              sidebarExpanded ? "left-[15.25rem]" : "left-[4.25rem]",
              "absolute top-12 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white"
            )}
            onClick={() => setSidebarExpanded((prev) => !prev)}
          >
            <span className="sr-only">Open sidebar</span>
            {sidebarExpanded ? (
              <ChevronLeftIcon className="text- h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Sidebar*/}
          <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
            {/* Sidebar logo*/}
            <div
              className={classNames(
                sidebarExpanded ? "justify-start" : "justify-center",
                "flex h-16 flex-shrink-0 items-center bg-gray-900 px-4"
              )}
            >
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                alt="Taskmate"
              />
            </div>

            {/* Sidebar main */}
            <nav className="flex flex-1 flex-col space-y-8 overflow-y-auto px-2 py-4">
              {/* Sidebar navigation content */}
              <div className="space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      sidebarExpanded ? "" : "justify-center",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300",
                        sidebarExpanded ? "mr-3" : "mr-0",
                        "h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {sidebarExpanded && item.name}
                  </a>
                ))}
              </div>

              {/* Sidebar projects and folders */}
              <div
                className={classNames(
                  !sidebarExpanded && "items-center",
                  "overlay flex flex-1 flex-col space-y-1"
                )}
              >
                <h3
                  className={classNames(
                    sidebarExpanded && "px-3",
                    "text-sm font-medium text-gray-500"
                  )}
                  id="projects-headline"
                >
                  Projects
                </h3>

                {/* reorderable boards and folders */}
                <div
                  className="overlay h-full w-full space-y-1"
                  role="group"
                  aria-labelledby="projects-headline"
                >
                  <DragDropContext
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                  >
                    {/* Drop zone for projects only */}
                    <Droppable
                      droppableId="boards"
                      type="sidebar"
                      isDropDisabled={boardsDropDisabled}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={classNames(
                            snapshot.isDraggingOver &&
                              "rounded border-2 border-gray-500 bg-gray-700 transition delay-150 duration-200"
                          )}
                        >
                          {boardsWithoutFolderData &&
                            boardsWithoutFolderData.boardOrder?.map(
                              (boardId, index) => {
                                const boardItem =
                                  boardsWithoutFolderData.boards.get(boardId);
                                return (
                                  !!boardItem && (
                                    <Draggable
                                      key={boardId}
                                      draggableId={boardId}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <BoardDisclosure
                                          folderItem={null}
                                          boardItem={boardItem!}
                                          provided={provided}
                                          snapshot={snapshot}
                                          sidebarExpanded={sidebarExpanded}
                                        />
                                      )}
                                    </Draggable>
                                  )
                                );
                              }
                            )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {/* Drop zone for folders only or combining of project with a folder */}
                    <Droppable
                      droppableId="folders"
                      type="sidebar"
                      isCombineEnabled={true}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={classNames(
                            snapshot.isDraggingOver &&
                              "rounded border-2 border-gray-500 bg-gray-700 transition delay-150 duration-200",
                            "flex flex-col gap-1"
                          )}
                        >
                          {folderData &&
                            folderData.folderOrder?.map((folderId, index) => {
                              const folderItem =
                                folderData.folders.get(folderId);
                              return (
                                !!folderItem && (
                                  <Draggable
                                    key={folderId}
                                    draggableId={folderId}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <FolderDisclosure
                                        provided={provided}
                                        snapshot={snapshot}
                                        sidebarExpanded={sidebarExpanded}
                                        folderItem={folderItem!}
                                        folder_order={folderData.folderOrder}
                                      />
                                    )}
                                  </Draggable>
                                )
                              );
                            })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </nav>

            {/* Sidebar footer */}
            <div
              className={classNames(
                sidebarExpanded ? "flex-row space-x-3" : "flex-col space-y-2",
                "isolate inline-flex justify-center rounded-md p-2 shadow-sm"
              )}
            >
              {/* Create new folder button */}
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-900 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => {
                  createFolder({
                    folderId: nanoid(),
                    name: "New Folder",
                    userId: sessionData.user.id,
                    currentFolderOrder: folderData?.folderOrder ?? [],
                  });
                }}
              >
                {sidebarExpanded ? (
                  <>
                    <FolderPlusIcon
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Folder
                  </>
                ) : (
                  <FolderPlusIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              {/* Create new board button */}
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-900 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() =>
                  createBoard({
                    boardId: nanoid(),
                    userId: sessionData.user.id,
                    currentBoardOrder:
                      boardsWithoutFolderData?.boardOrder ?? [],
                    title: "New Board",
                  })
                }
              >
                {sidebarExpanded ? (
                  <>
                    <DocumentPlusIcon
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Board
                  </>
                ) : (
                  <DocumentPlusIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-x-auto">
          {/* Top Nav */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            {/* Sidebar toggle, controls the 'sidebarOpen' sidebar state. Only in mobile mode*/}
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Top Nav content */}
            <div className="flex flex-1 items-center justify-between gap-2 px-4">
              <h1 className="hidden text-2xl font-semibold text-gray-900 md:block">
                {title}
              </h1>

              {/* Search bar */}
              <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="w-full max-w-lg lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
              </div>

              {/* Notifcation and profile */}
              <div className="flex items-center md:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={
                          sessionData
                            ? sessionData.user.image!
                            : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        }
                        alt="user profile image"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                if (item.name === "Sign out") {
                                  signOut({
                                    callbackUrl: "/",
                                    redirect: true,
                                  })
                                    .then((data) => console.log(data))
                                    .catch((err) => console.log(err));
                                }
                              }}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          {/* Main content goes here */}
          <main className="flex flex-1 flex-col overflow-x-auto px-4 py-2 sm:px-6 sm:py-4 md:px-8 md:py-6">
            {/* Replace with your content */}
            {children}
            {/* /End replace */}
          </main>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
