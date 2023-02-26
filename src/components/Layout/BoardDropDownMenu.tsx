import { Fragment, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/helper";
import useDeleteFolder from "@/utils/mutations/useDeleteFolder";
import { BarsArrowUpIcon, PencilIcon } from "@heroicons/react/24/outline";
import useClickAway from "@/utils/hooks/useClickAway";
import { api } from "@/utils/api";
import { Board } from "@prisma/client";
import useDeleteBoard from "@/utils/mutations/useDeleteBoard";
import { FolderWithBoards } from "server/api/routers/folder";
import useRemoveBoardFromFolder from "@/utils/mutations/useRemoveBoardFromFolder";

interface BoardDropDownMenuProps {
  boardItem: Board;
  folderItem: FolderWithBoards | null;
  setDropDownMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBoardRenameInputVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setmenuButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardDropDownMenu: React.FC<BoardDropDownMenuProps> = ({
  boardItem,
  folderItem,
  setDropDownMenuOpen,
  setBoardRenameInputVisible,
  setmenuButtonVisible,
}) => {
  // Ref for detecting click outside of drop down menu
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickAway(wrapperRef, () => setmenuButtonVisible(false));

  // Keep track of mouse position state to position the menu
  const [mousePostion, setMousePosition] = useState({ x: 0, y: 0 });

  // Query to get board order of boards without folder
  const { data: boardsWithoutFolderData } =
    api.board.getUserBoardWithoutFolder.useQuery({
      userId: boardItem.user_id,
    });

  const { mutate: deleteBoard } = useDeleteBoard();
  const { mutate: removeBoardFromFolder } = useRemoveBoardFromFolder();

  return (
    <Menu as="div" className="relative text-left">
      <Menu.Button
        className="flex items-center rounded-md bg-transparent text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          const { x, y } = e.currentTarget.getBoundingClientRect();
          setMousePosition({ x, y });
        }}
      >
        <span className="sr-only">Open options</span>
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100 "
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          ref={wrapperRef}
          className="fixed z-10 mt-2 w-56 origin-top-right cursor-pointer rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          style={{
            left: mousePostion.x,
            top: mousePostion.y,
          }}
        >
          {({ open }) => {
            setDropDownMenuOpen(open);
            return (
              <div className="py-1">
                {/* Menu option to rename board */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm"
                      )}
                      onClick={(e) => {
                        setBoardRenameInputVisible(true);
                      }}
                    >
                      <PencilIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Rename
                    </div>
                  )}
                </Menu.Item>

                {/* Menu option to deleteBoard */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm"
                      )}
                      onClick={(e) => {
                        // TODO: Add a confirmation modal

                        deleteBoard({
                          boardId: boardItem.id,
                          userId: boardItem.user_id,
                          isOrganized: boardItem.folder_id ? true : false,
                          rootBoardOrder: boardsWithoutFolderData!.boardOrder,
                          folderBoardOrder: folderItem?.board_order ?? null,
                          folderId: boardItem.folder_id,
                        });
                      }}
                    >
                      <TrashIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Delete
                    </div>
                  )}
                </Menu.Item>

                {/* Menu option to remove board from folder */}
                {folderItem && (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "group flex items-center px-4 py-2 text-sm"
                        )}
                        onClick={(e) => {
                          // Call remove board from folder mutation
                          removeBoardFromFolder({
                            boardId: boardItem.id,
                            folderId: folderItem.id,
                            folderBoardOrder: folderItem.board_order,
                            rootBoardOrder: boardsWithoutFolderData!.boardOrder,
                            userId: boardItem.user_id,
                          });
                        }}
                      >
                        <BarsArrowUpIcon
                          className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        Remove from folder
                      </div>
                    )}
                  </Menu.Item>
                )}
                {/* <form method="POST" action="#">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="submit"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block w-full px-4 py-2 text-left text-sm"
                    )}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </form> */}
              </div>
            );
          }}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
export default BoardDropDownMenu;
