/* DONE BY: Ding RuoQian 2100971 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import UserModal from "../modal/UserModal";
import { Tooltip } from "@mui/material";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { nanoid } from "nanoid";
import useCreatePanel from "@/utils/mutations/panel/useCreatePanel";
import CircularProgressWithLabel from "../custom/CircularProgressWithLabel";
import BoardDropDownMenu from "../layout/BoardDropDownMenu";
import { classNames, trimChar } from "@/utils/helper";
import ConfirmationModal from "../layout/ConfirmationModal";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import useRenameBoard from "@/utils/mutations/useRenameBoard";
import useDeleteBoard from "@/utils/mutations/useDeleteBoard";
import { useToastContext } from "@/utils/context/ToastContext";
import useClickAway from "@/utils/hooks/useClickAway";

import type { Board, Board_Collaborator, User } from "@prisma/client";
import type {
  BoardDetailed,
  FolderWithBoards,
} from "server/api/routers/folder";
import { useSession } from "next-auth/react";

interface BoardProps {
  boardItem: BoardDetailed;
  folderItem?: FolderWithBoards;
  className?: string;
}

const Board: React.FC<BoardProps> = ({
  boardItem,
  folderItem,
  className = "",
}) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const addToast = useToastContext();

  const [openUserModal, setOpenUserModal] = React.useState(false);
  const [currUser, setCurrUser] = useState<User>(boardItem.user);

  const [boardRenameInputVisible, setBoardRenameInputVisible] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(
    boardItem.board_title ?? ""
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Query to get board data
  const { data: boardData } = api.board.getBoardById.useQuery({
    boardId: boardItem.id,
  });

  // Query to get board order of boards without folder
  const { data: boardsWithoutFolderData } =
    api.board.getUserBoardWithoutFolder.useQuery({
      userId: boardItem.user_id,
    });

  // Board mutations
  const { mutate: createPanel } = useCreatePanel();
  const { mutate: renameBoard } = useRenameBoard();
  const { mutateAsync: deleteBoard } = useDeleteBoard();

  // Effect for setting rename input value to folder name when clicked away
  useEffect(() => {
    setRenameInputValue(boardItem.board_title ?? "");
  }, [boardRenameInputVisible, boardItem.board_title]);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setBoardRenameInputVisible(false));

  const handleCreateNewPanel = () => {
    // Create new panel and update state
    const newPanelId = nanoid(10);
    const panelCount = boardData?.Panel.length;
    const currentPanelOrder = panelCount
      ? boardData.Panel[panelCount - 1]!.order
      : 0;
    createPanel({
      userId: boardItem.user.id,
      boardId: boardItem.id,
      panelId: newPanelId,
      prevPanelOrder: currentPanelOrder,
    });
  };

  const getCollaboratorsAvatar = (
    collaborators: ({ User: User } | (Board_Collaborator & { User: User }))[]
  ) => {
    // Set max display count to 5
    const count = 5;
    const collaboratorAvatars = collaborators
      .map((collaborator, index) => {
        const user = collaborator.User;
        const zIndexes = ["z-50", "z-40", "z-30", "z-20", "z-10"];
        return (
          <Tooltip
            key={user.id}
            title={user.name}
            className="cursor-pointer"
            onClick={() => {
              setCurrUser(user);
              setOpenUserModal(true);
            }}
          >
            <img
              className={classNames(
                zIndexes[index] ?? "",
                "relative inline-block h-8 w-8 rounded-full ring-2 ring-white"
              )}
              src={user.image ?? ""}
              alt={`Board collaborator - ${user.name ?? ""}`}
            />
          </Tooltip>
        );
      })
      .filter((_, index) => index < count);

    const balance = collaborators.length - count;
    if (balance > 0) {
      collaboratorAvatars.push(
        <Tooltip
          title={`+${balance} more`}
          className="flex cursor-pointer items-center justify-center"
        >
          <p className="relative z-0 inline-block h-8 w-8 rounded-full bg-gray-900 text-gray-400 ring-2 ring-white">
            +{balance}
          </p>
        </Tooltip>
      );
    }

    return collaboratorAvatars;
  };

  const getBoardLink = () => {
    if (boardItem.user_id !== sessionData?.user.id) {
      return `/board/collaboration/${boardItem.id}`;
    }
    return boardItem.folder_id
      ? `/board/${boardItem.folder_id}/${boardItem.id}`
      : `/board/${boardItem.id}`;
  };

  return (
    <div
      className={classNames(
        className,
        "w-80 min-w-sm rounded-lg bg-white shadow hover:shadow-inner hover:ring-2 sm:w-96 sm:min-w-md"
      )}
    >
      {/* Board header */}
      <div className="flex items-center justify-between px-2 py-3 sm:px-4">
        {boardRenameInputVisible ? (
          <div
            ref={wrapperRef}
            className="z-30 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600"
          >
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-900"
            >
              Rename Board
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
              placeholder="Board name"
              autoFocus
              value={renameInputValue ?? ""}
              onChange={(e) => setRenameInputValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                // Close input form on enter or escape
                if (e.key === "Enter" || e.key === "Escape") {
                  setBoardRenameInputVisible(false);
                }

                // Persist new name to board on enter
                if (e.key === "Enter") {
                  renameBoard({
                    boardId: boardItem.id,
                    title: renameInputValue,
                    userId: boardItem.user_id,
                    folderId: folderItem?.id ?? null,
                    isOrganized: folderItem ? true : false,
                  });
                }
              }}
            />
          </div>
        ) : (
          <Tooltip title="View board">
            <Link href={getBoardLink()} className="w-6/12">
              <h3 className="truncate text-base font-semibold leading-6 text-gray-900">
                {boardItem.thumbnail_image} {boardItem.board_title}
              </h3>
            </Link>
          </Tooltip>
        )}
        <div className="flex items-center">
          {/* Render board members */}
          <div className="isolate mr-1 flex items-center -space-x-2 overflow-hidden">
            {getCollaboratorsAvatar([
              { User: boardItem.user },
              ...boardItem.Board_Collaborator,
            ])}
          </div>
          <BoardDropDownMenu
            boardItem={boardItem}
            folderItem={folderItem ?? null}
            setBoardRenameInputVisible={setBoardRenameInputVisible}
            setDeleteModalOpen={setDeleteModalOpen}
          />
        </div>
        <UserModal
          open={openUserModal}
          setOpen={setOpenUserModal}
          user={currUser}
        />
      </div>

      {/* Board body */}
      <div className="overlay scrollbar-hide flex h-64 max-h-64 flex-col gap-2 border-t border-gray-200 bg-transparent px-2 py-3 sm:px-3">
        {boardData?.Panel.map((panel) => (
          <div key={panel.id} className="rounded-md border px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Tooltip title="View panel">
                  <Link href={getBoardLink()}>
                    <h4 className="text-sm font-medium text-gray-900">
                      {panel.panel_title ?? "Untitled"}
                    </h4>
                  </Link>
                </Tooltip>

                {/* TODO to be refactored- Render pills */}
                <div className="flex gap-1">
                  {/* Create pills with colors */}
                  {/* {pills.map(
                    (pill, index) =>
                      Math.random() > 0.5 && (
                        <Tooltip key={index} title={pill.name}>
                          {pill.element}
                        </Tooltip>
                      )
                  )} */}
                </div>
              </div>
              <CircularProgressWithLabel
                value={(() => {
                  const completedTasks = panel.Task.filter(
                    (task) => task.is_completed
                  ).length;
                  const totalTasks = panel.Task.length;
                  return totalTasks
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0;
                })()}
                color={"success"}
                size={35}
                thickness={5}
              />
            </div>
          </div>
        ))}

        {/* Show board empty state placeholder when there are no panels*/}
        {!boardData?.Panel.length && (
          <button
            type="button"
            className="relative block h-full w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() =>
              void router.push(getBoardLink()).then(() =>
                setTimeout(() => {
                  handleCreateNewPanel();
                }, 500)
              )
            }
          >
            <PlusIcon className="mx-auto h-10 w-10 text-gray-400" />
            <span className="mt-2 block text-sm font-semibold text-gray-900">
              Create a new panel
            </span>
          </button>
        )}
      </div>

      {/* Confirmation modal for deleting a board */}
      <ConfirmationModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        ModalIcon={TrashIcon}
        title="Delete Board"
        description="Are you sure you want to delete this board? This action cannot be undone."
        confirmText="Delete Board"
        onConfirm={() => {
          void (async () => {
            await deleteBoard({
              boardId: boardItem.id,
              userId: boardItem.user_id,
              isOrganized: boardItem.folder_id ? true : false,
              rootBoardOrder: boardsWithoutFolderData!.boardOrder,
              folderBoardOrder: folderItem?.board_order ?? null,
              folderId: boardItem.folder_id,
            });
            // Redirect to dashboard if deleting board that is currently open
            const pathParams = trimChar(["/"], router.asPath).split("/");
            if (pathParams[pathParams.length - 1] === boardItem.id) {
              await router.push("/dashboard");
              setTimeout(
                () =>
                  addToast({
                    title: "Board deleted successfully",
                    description: `Your board with the title "${
                      boardItem.board_title ?? "NULL"
                    }" was deleted successfully`,
                    icon: TrashIcon,
                  }),
                300
              );
              return;
            }
            setTimeout(
              () =>
                addToast({
                  title: "Board deleted successfully",
                  description: `Your board with the title "${
                    boardItem.board_title ?? "NULL"
                  }" was deleted successfully`,
                  icon: TrashIcon,
                }),
              300
            );
          })();
        }}
      />
    </div>
  );
};

export default Board;
