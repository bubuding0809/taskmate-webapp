/* DONE BY: Ding RuoQian 2100971 */

import React, { useEffect, useRef, useState } from "react";
import FolderDropDownMenu from "../layout/FolderDropDownMenu";
import Board from "./Board";

import type { FolderWithBoards } from "server/api/routers/folder";
import Divider from "../custom/Divider";
import ConfirmationModal from "../modal/ConfirmationModal";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import useRenameFolder from "@/utils/mutations/useRenameFolder";
import useDeleteFolder from "@/utils/mutations/useDeleteFolder";
import useCreateBoard from "@/utils/mutations/useCreateBoard";
import { api } from "@/utils/api";
import useClickAway from "@/utils/hooks/useClickAway";
import { IconButton, Tooltip } from "@mui/material";
import { Save } from "@mui/icons-material";
import { nanoid } from "nanoid";
import { classNames } from "@/utils/helper";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface FolderProps {
  folderItem: FolderWithBoards;
  folderOrder: string[];
  className?: string;
}

const Folder: React.FC<FolderProps> = ({
  folderItem,
  folderOrder,
  className = "",
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAnimateError, setIsAnimateError] = useState(false);
  const [isEditFolderName, setIsEditFolderName] = useState(false);
  const [folderName, setFolderName] = useState(folderItem.folder_name);

  // Query to get board order of boards without folder
  const { data: boardsWithoutFolderData } =
    api.board.getUserBoardWithoutFolder.useQuery({
      userId: folderItem.user_id,
    });

  // folder mutations
  const { mutate: renameFolder } = useRenameFolder();
  const { mutate: deleteFolder } = useDeleteFolder();
  const { mutateAsync: createBoard } = useCreateBoard();

  // Scroll ref to scroll to bottom of folder
  const scrollRef = useRef<HTMLDivElement>(null);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setIsEditFolderName(false));

  // Set up autoAnimation for div and form elements
  const [animationParent] = useAutoAnimate<HTMLDivElement>();

  const handleSaveFolderName = (e: React.FormEvent) => {
    e.preventDefault();

    // If panel title is empty, animate error
    if (!folderName.trim()) {
      setIsAnimateError(true);
      setTimeout(() => {
        setIsAnimateError(false);
      }, 1000);
      return;
    }

    // Mutation to update panel title
    renameFolder({
      folderId: folderItem.id,
      newName: folderName,
      userId: folderItem.user_id,
    });

    // set panel edit state to false
    setIsEditFolderName(false);
  };

  return (
    <div
      key={folderItem.id}
      className={classNames("shadow-inner", className)}
      style={{
        backgroundColor: "rgba(220, 220, 220, 0.4)",
        border: "1px solid rgba(175, 175, 175, 0.36)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "6px",
      }}
    >
      {/* Folder header */}
      <div className="flex flex-col rounded-t">
        <div className="flex items-center justify-between px-2 py-2 sm:px-4">
          {/* Header left */}
          {isEditFolderName ? (
            // Panel title edit form
            <form
              className={classNames(
                isAnimateError && "animate__headShake",
                "animate__animated"
              )}
              onSubmit={handleSaveFolderName}
            >
              <div className="relative" ref={wrapperRef}>
                <label
                  htmlFor="name"
                  className="inline-block bg-transparent px-1 text-xs font-medium text-gray-900"
                >
                  Folder name
                </label>
                <input
                  autoFocus
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full rounded-md border-0 py-1.5 pr-9 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-2xl sm:leading-6"
                  placeholder="Folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyUp={(e) => {
                    if (e.key === "Escape") {
                      setIsEditFolderName(false);
                    }
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 27,
                    right: 5,
                  }}
                  size="small"
                  onClick={handleSaveFolderName}
                >
                  <Save
                    sx={{
                      fontSize: "20px",
                    }}
                  />
                </IconButton>
              </div>
            </form>
          ) : (
            <Tooltip title="Double click to edit folder name">
              <h3
                className="cursor-pointer truncate text-2xl font-semibold text-gray-900"
                onDoubleClick={() => setIsEditFolderName(true)}
              >
                {folderItem.thumbnail_image} {folderItem.folder_name}
              </h3>
            </Tooltip>
          )}
          <span className="mr-auto ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-800">
            {
              // Get board count of folder
              folderItem.board_order?.length ?? 0
            }
          </span>

          {/* Header right */}
          <div className="flex items-center gap-2">
            {/* Button to open task creation modal */}
            <button
              type="button"
              className="flex gap-1 rounded-full bg-white py-2.5 px-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => {
                createBoard({
                  boardId: nanoid(),
                  userId: folderItem.user_id,
                  title: "New Board",
                  currentBoardOrder: boardsWithoutFolderData?.boardOrder ?? [],
                  folderId: folderItem.id,
                  folderBoardOrder: folderItem.board_order ?? [],
                })
                  .then(() => {
                    scrollRef.current?.scrollIntoView({
                      behavior: "smooth",
                      inline: "end",
                      block: "nearest",
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            >
              Board
              <PlusIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
            </button>
            <FolderDropDownMenu
              setFolderRenameInputVisible={setIsEditFolderName}
              setDeleteModalOpen={setDeleteModalOpen}
              dashboard={true}
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Folder content, filled with boards */}
      <div
        ref={animationParent}
        className="flex w-full snap-x gap-2 overflow-x-auto p-2"
      >
        {folderItem.board_order.map((boardId) => {
          const boardItem = folderItem.boards.get(boardId);
          return (
            !!boardItem && (
              <Board
                className="snap-center"
                boardItem={boardItem}
                key={boardItem.id}
                folderItem={folderItem}
              />
            )
          );
        })}

        {folderItem.board_order.length === 0 && (
          <button
            type="button"
            className="relative block h-80 w-96 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => {
              createBoard({
                boardId: nanoid(),
                userId: folderItem.user_id,
                title: "New Board",
                currentBoardOrder: boardsWithoutFolderData?.boardOrder ?? [],
                folderId: folderItem.id,
                folderBoardOrder: folderItem.board_order ?? [],
              })
                .then(() => {
                  scrollRef.current?.scrollIntoView({
                    behavior: "smooth",
                    inline: "end",
                    block: "nearest",
                  });
                })
                .catch((err) => {
                  console.log(err);
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

        {/* Empty div to scroll to bottom of folder */}
        <div ref={scrollRef} />
      </div>

      {/* Delete folder modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete folder"
        description="Are you sure you want to delete this folder? This action cannot be undone. All boards in this folder will be moved to the unorganized board area."
        ModalIcon={TrashIcon}
        confirmText="Delete Folder"
        onConfirm={() => {
          deleteFolder({
            folderId: folderItem.id,
            userId: folderItem.user_id,
            folderOrder: folderOrder,
            boardOrder: boardsWithoutFolderData!.boardOrder,
            boardIdsToBeUpdated: folderItem.board_order,
          });
        }}
      />
    </div>
  );
};

export default Folder;
