import Link from "next/link";
import BoardDropDownMenu from "./BoardDropDownMenu";
import ConfirmationModal from "@/components/Layout/ConfirmationModal";
import { api } from "@/utils/api";
import { useRef, useEffect, useState } from "react";
import { classNames, trimChar } from "../../utils/helper";
import { Fade, Tooltip } from "@mui/material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import useDeleteBoard from "@/utils/mutations/useDeleteBoard";
import useClickAway from "@/utils/hooks/useClickAway";
import useRenameBoard from "@/utils/mutations/useRenameBoard";

import type { Board } from "@prisma/client";
import type { FolderWithBoards } from "server/api/routers/folder";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { useToastContext } from "@/utils/context/ToastContext";

interface BoardDisclosureProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  boardItem: Board;
  folderItem: FolderWithBoards | null;
  sidebarExpanded: boolean;
}

const BoardDisclosure: React.FC<BoardDisclosureProps> = ({
  provided,
  snapshot,
  boardItem,
  folderItem,
  sidebarExpanded,
}) => {
  const router = useRouter();
  const addToast = useToastContext();

  const [menuButtonVisible, setMenuButtonVisible] = useState(false);
  const [dropDownMenuOpen, setDropDownMenuOpen] = useState(false);
  const [boardRenameInputVisible, setBoardRenameInputVisible] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(
    boardItem.board_title ?? ""
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Effect for setting rename input value to folder name when clicked away
  useEffect(() => {
    setRenameInputValue(boardItem.board_title ?? "");
  }, [boardRenameInputVisible, boardItem.board_title]);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setBoardRenameInputVisible(false));

  // Query to get board order of boards without folder
  const { data: boardsWithoutFolderData } =
    api.board.getUserBoardWithoutFolder.useQuery({
      userId: boardItem.user_id,
    });

  // Rename board mutation
  const { mutate: renameBoard } = useRenameBoard();
  const { mutateAsync: deleteBoard } = useDeleteBoard();

  return (
    <>
      {/* Board name input form, is postioned fixed */}
      {boardRenameInputVisible && (
        <div
          ref={wrapperRef}
          className="absolute z-30 w-60 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600"
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

              // Persist new name to folder on enter
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
      )}

      {/* Link element for board */}
      <Tooltip
        title="Drop to add"
        open={!!snapshot.combineWith}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
      >
        <Link
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          href={(() => {
            return folderItem
              ? `/board/${folderItem.folder_name}/${boardItem.id}`
              : `/board/${boardItem.id}`;
          })()}
          className={classNames(
            sidebarExpanded ? "justify-between" : "justify-center",
            snapshot.isDragging &&
              "rounded border-3 border-slate-400 bg-slate-50/80 bg-slate-700 shadow-solid-small shadow-gray-900",
            !!snapshot.combineWith && "bg-emerald-400/50",
            "group flex w-full items-center rounded-md px-2 py-1 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          )}
          onMouseEnter={() => setMenuButtonVisible(true)}
          onMouseLeave={() => !dropDownMenuOpen && setMenuButtonVisible(false)}
        >
          <div
            className={classNames(
              sidebarExpanded ? "w-11/12" : "w-full justify-center",
              "flex items-center"
            )}
          >
            <span
              className={classNames(
                sidebarExpanded ? "mr-3" : "mr-0",
                "cursor-pointer text-xl"
              )}
            >
              {boardItem ? boardItem.thumbnail_image : "???"}
            </span>
            {sidebarExpanded && (
              <p className="cursor-pointer truncate overflow-ellipsis">
                {boardItem.board_title}
              </p>
            )}
          </div>
          {sidebarExpanded && (
            <div
              className={classNames(
                menuButtonVisible ? "visible" : "invisible",
                "w-1/12"
              )}
            >
              <BoardDropDownMenu
                boardItem={boardItem}
                folderItem={folderItem}
                setDropDownMenuOpen={setDropDownMenuOpen}
                setBoardRenameInputVisible={setBoardRenameInputVisible}
                setMenuButtonVisible={setMenuButtonVisible}
                setDeleteModalOpen={setDeleteModalOpen}
              />
            </div>
          )}
        </Link>
      </Tooltip>

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
                    description: `Your board with the title "${boardItem.board_title}" was deleted successfully`,
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
                  description: `Your board with the title "${boardItem.board_title}" was deleted successfully`,
                  icon: TrashIcon,
                }),
              300
            );
          });
        }}

        // TODO - Clean up commented code when done testing
        // () =>
        // void deleteBoard({
        //   boardId: boardItem.id,
        //   userId: boardItem.user_id,
        //   isOrganized: boardItem.folder_id ? true : false,
        //   rootBoardOrder: boardsWithoutFolderData!.boardOrder,
        //   folderBoardOrder: folderItem?.board_order ?? null,
        //   folderId: boardItem.folder_id,
        // })
        //   .then(() => {
        //     // Redirect to dashboard if deleting board that is currently open
        //     router.asPath.split("/")[2] === boardItem.id &&
        //       void router.push("/dashboard").then(() =>
        //         setTimeout(
        //           () =>
        //             addToast({
        //               title: "Board deleted successfully",
        //               description: "Your board was deleted successfully",
        //             }),
        //           300
        //         )
        //       );
        //   })
        //   .catch((err) => console.log(err))
      />
    </>
  );
};

export default BoardDisclosure;
