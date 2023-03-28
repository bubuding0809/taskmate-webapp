/* DONE BY: Ding RuoQian 2100971 */

import type { NextPageWithLayout } from "../_app";
import { ReactElement, useEffect, useRef, useState } from "react";
import AppLayout from "../../components/Layout/AppLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";

import Folder from "@/components/Dashboard/Folder";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Board from "@/components/Dashboard/Board";
import { nanoid } from "nanoid";
import useCreateBoard from "@/utils/mutations/useCreateBoard";
import { DocumentPlusIcon, FolderPlusIcon } from "@heroicons/react/20/solid";
import useCreateFolder from "@/utils/mutations/useCreateFolder";
import CreateBoardSlideOver from "@/components/Layout/CreateBoardSliderOver";

// TODO - TBD - This is just a placeholder for now
const stats = [
  { label: "Boards", value: 12 },
  { label: "Panels", value: 4 },
  { label: "Tasks", value: 2 },
];

const DashboardPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: sessionData, status } = useSession();

  // Ref to scroll to bottom of folder
  const folderEndRef = useRef<HTMLDivElement>(null);

  // Query to get the user's folders
  const { data: folderData } = api.folder.getAllUserFolders.useQuery(
    {
      userId: sessionData?.user.id ?? "",
    },
    {
      enabled: !!sessionData?.user.id,
    }
  );

  // Query to get all unorgainzed boards
  const { data: unorgainzedBoardData } =
    api.board.getUserBoardWithoutFolder.useQuery(
      {
        userId: sessionData?.user.id ?? "",
      },
      {
        enabled: !!sessionData?.user.id,
      }
    );

  //Query to get user stats
  const { data: userStats } = api.user.getUserStats.useQuery(
    {
      userId: sessionData?.user.id ?? "",
    },
    {
      enabled: !!sessionData?.user.id,
    }
  );

  const { mutate: createBoard } = useCreateBoard();
  const { mutate: createFolder } = useCreateFolder();

  // TODO - Revisit the background position logic
  const [backgroundPosition, setBackgroundPosition] = useState({
    x: 0,
    y: 0,
  });

  // Store previous folder length to check if a new folder was added
  const [prevFolderLength, setPrevFolderLength] = useState(Infinity);

  // Setup open state for board creation slideover
  const [boardCreationOpen, setBoardCreationOpen] = useState(false);

  // Set up autoAnimation for div and form elements
  const [boardParent] = useAutoAnimate<HTMLDivElement>();

  // Scroll to bottom of folder when a new folder is added
  useEffect(() => {
    // Only run if folderData has been loaded
    if (!folderData) return;

    // If a new folder was added, scroll to bottom of folder
    if (prevFolderLength < folderData.folderOrder.length) {
      folderEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setPrevFolderLength(folderData?.folderOrder.length);
    }

    // If a folder was deleted, update the prevFolderLength
    if (prevFolderLength > folderData.folderOrder.length) {
      setPrevFolderLength(folderData.folderOrder.length);
    }
  }, [folderData, prevFolderLength]);

  // Return loading screen while session is loading
  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="h-full py-4">
        {/* Profile */}
        <section className="px-4" aria-labelledby="profile-overview-title">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {/* H2 for screen reader only */}
            <h2 className="sr-only" id="profile-overview-title">
              Profile Overview
            </h2>
            <div
              className="relative h-60 xl:h-80 2xl:h-96"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1676557059846-2dad064ae6e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* TODO - Revisit the background position logic */}
              {/* Reposition image button */}
              {/* <button
              type="button"
              className="absolute bottom-2 right-2 rounded bg-white py-1 px-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => {
                // Attach a listener to the window to check for arrow key presses
                // When the user presses an arrow key, update the background position
                // Remove the listener when the user presses the Esc key
                const handleKeyDown = (event: KeyboardEvent) => {
                  if (event.key === "Escape" || event.key === "Enter") {
                    console.log("Remove listener");
                    window.removeEventListener("keydown", handleKeyDown);
                  }

                  if (event.key === "ArrowUp") {
                    // Update background position
                    setBackgroundPosition((prev) => ({
                      ...prev,
                      y: prev.y - 10,
                    }));
                  }

                  if (event.key === "ArrowDown") {
                    // Update background position
                    setBackgroundPosition((prev) => ({
                      ...prev,
                      y: prev.y + 10,
                    }));
                  }

                  if (event.key === "ArrowLeft") {
                    // Update background position
                    setBackgroundPosition((prev) => ({
                      ...prev,
                      x: prev.x - 10,
                    }));
                  }

                  if (event.key === "ArrowRight") {
                    // Update background position
                    setBackgroundPosition((prev) => ({
                      ...prev,
                      x: prev.x + 10,
                    }));
                  }
                };

                window.addEventListener("keydown", handleKeyDown);
              }}
            >
              Reposition image
            </button> */}
            </div>
            <div className="bg-white p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                {/* Profile left */}
                <div className="sm:flex sm:space-x-5">
                  {/* User image */}
                  <div className="flex-shrink-0">
                    <img
                      className="mx-auto h-20 w-20 rounded-full"
                      src={sessionData?.user.image ?? ""}
                      alt=""
                    />
                  </div>

                  {/* User info */}
                  <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                    <p className="text-sm font-medium text-gray-600">
                      Welcome back,
                    </p>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {sessionData?.user?.name}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {sessionData?.user.email}
                    </p>
                  </div>
                </div>

                {/* Profile right */}
                <div className="mt-5 flex justify-center sm:mt-0">
                  <a
                    href="#"
                    className="flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    View profile
                  </a>
                </div>
              </div>
            </div>

            {/* TODO - To be replaced with a queries to get real data */}
            {/* Footer stats */}
            <div className="grid grid-cols-1 divide-y divide-x divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
              {Object.entries(userStats ?? {}).map(
                ([key, value]: [string, number]) => (
                  <div
                    key={key}
                    className="px-6 py-5 text-center text-sm font-medium"
                  >
                    <span className="text-gray-900">{value}</span>{" "}
                    <span className="text-gray-600">{key}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Boards and Folders */}
        <section
          aria-labelledby="folders-title"
          className="mt-4 bg-transparent"
        >
          {/* H2 for screen reader only */}
          <h2 className="sr-only" id="folders-title">
            Folders and Boards
          </h2>

          {/* Grid for folders and boards */}
          <div className="grid gap-4 overflow-x-auto">
            <div className="z-0 col-span-full flex flex-col gap-4 overflow-x-auto bg-white px-4 py-4">
              <div className="col-span-full flex justify-between">
                <h2 className="col-span-full flex items-center indent-2 text-3xl font-semibold">
                  📚 Boards
                </h2>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => setBoardCreationOpen(true)}
                >
                  New board
                  <DocumentPlusIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* flexbox for unorganized boards */}
              <div
                ref={boardParent}
                className="col-span-full flex flex-grow gap-2 overflow-x-auto p-1"
              >
                {!!unorgainzedBoardData?.boardOrder.length ? (
                  unorgainzedBoardData?.boardOrder.map((boardId) => {
                    const boardItem = unorgainzedBoardData?.boards.get(boardId);
                    return (
                      !!boardItem && (
                        <Board
                          key={boardItem.id}
                          boardItem={boardItem}
                          className="border"
                        />
                      )
                    );
                  })
                ) : (
                  <button
                    type="button"
                    className="relative block h-80 w-96 min-w-md rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      createBoard({
                        boardId: nanoid(),
                        userId: sessionData!.user.id,
                        title: "New Board",
                        currentBoardOrder:
                          unorgainzedBoardData?.boardOrder ?? [],
                      });
                    }}
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                      />
                    </svg>
                    <span className="mt-2 block text-sm font-semibold text-gray-900">
                      Create a new board
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="z-0 col-span-full grid grid-cols-1 gap-4 bg-white px-4 py-4 2xl:grid-cols-2">
              <div className="col-span-full flex justify-between">
                <h2 className="indent-2 text-3xl font-semibold">🗂️ Folders</h2>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() =>
                    createFolder({
                      folderId: nanoid(),
                      name: "New Folder",
                      userId: sessionData!.user.id,
                      currentFolderOrder: folderData?.folderOrder ?? [],
                    })
                  }
                >
                  New folder
                  <FolderPlusIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Folder components */}
              {folderData?.folderOrder.map((folderId) => {
                const folderItem = folderData?.folders.get(folderId);
                return (
                  !!folderItem && (
                    <Folder
                      key={folderItem.id}
                      folderItem={folderItem}
                      folderOrder={folderData.folderOrder}
                    />
                  )
                );
              })}
              {/* Placeholder div to scroll to when the user clicks the "Add folder" button*/}
              <div ref={folderEndRef} />
            </div>
          </div>
        </section>
      </div>

      {/* Board creation sliderover */}
      <CreateBoardSlideOver
        open={boardCreationOpen}
        setOpen={setBoardCreationOpen}
      />
    </>
  );
};
export default DashboardPage;

DashboardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Dashboard">{page}</AppLayout>;
};
