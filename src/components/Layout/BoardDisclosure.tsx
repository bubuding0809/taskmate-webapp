import { useRef, useEffect, useState } from "react";
import { classNames } from "../../utils/helper";
import Link from "next/link";
import { Board } from "@prisma/client";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import useClickAway from "@/utils/hooks/useClickAway";
import BoardDropDownMenu from "./BoardDropDownMenu";
import useRenameBoard from "@/utils/mutations/useRenameBoard";
import { FolderWithBoards } from "server/api/routers/folder";
import { Fade, Tooltip } from "@mui/material";

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
  const [menuButtonVisible, setMenuButtonVisible] = useState(false);
  const [dropDownMenuOpen, setDropDownMenuOpen] = useState(false);
  const [boardRenameInputVisible, setBoardRenameInputVisible] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(
    boardItem.board_title ?? ""
  );

  // Effect for setting rename input value to folder name when clicked away
  useEffect(() => {
    setRenameInputValue(boardItem.board_title ?? "");
  }, [boardRenameInputVisible, boardItem.board_title]);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setBoardRenameInputVisible(false));

  // Rename board mutation
  const { mutate: renameBoard } = useRenameBoard();

  return (
    <>
      {/* Board name input form, is postioned fixed */}
      {boardRenameInputVisible && (
        <div
          ref={wrapperRef}
          className="form-input absolute z-30 w-60 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600"
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
            className="form-input block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
            placeholder="Jane Smith"
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
          href={`/board/${boardItem.id}`}
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
                setmenuButtonVisible={setMenuButtonVisible}
              />
            </div>
          )}
        </Link>
      </Tooltip>
    </>
  );
};

export default BoardDisclosure;
