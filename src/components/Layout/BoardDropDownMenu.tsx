import { Fragment, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import { classNames, trimChar } from "@/utils/helper";
import { BarsArrowUpIcon, PencilIcon } from "@heroicons/react/24/outline";
import useClickAway from "@/utils/hooks/useClickAway";
import { api } from "@/utils/api";
import { Board } from "@prisma/client";
import { FolderWithBoards } from "server/api/routers/folder";
import useRemoveBoardFromFolder from "@/utils/mutations/useRemoveBoardFromFolder";
import { useRouter } from "next/router";

interface BoardDropDownMenuProps {
  boardItem: Board;
  folderItem: FolderWithBoards | null;
  setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMenuButtonVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  setDropDownMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setBoardRenameInputVisible: React.Dispatch<React.SetStateAction<boolean>>;
  dashboard?: boolean;
}

const BoardDropDownMenu: React.FC<BoardDropDownMenuProps> = ({
  boardItem,
  folderItem,
  setDropDownMenuOpen,
  setBoardRenameInputVisible,
  setMenuButtonVisible,
  setDeleteModalOpen,
  dashboard,
}) => {
  const router = useRouter();

  // Ref for detecting click outside of drop down menu
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickAway(
    wrapperRef,
    () => !!setMenuButtonVisible && setMenuButtonVisible(false)
  );

  // Keep track of mouse position state to position the menu
  const [mousePostion, setMousePosition] = useState({ x: 0, y: 0 });

  // Query to get board order of boards without folder
  const { data: boardsWithoutFolderData } =
    api.board.getUserBoardWithoutFolder.useQuery({
      userId: boardItem.user_id,
    });

  const { mutateAsync: removeBoardFromFolder } = useRemoveBoardFromFolder();

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
          className={classNames(
            dashboard ? "absolute right-0" : "fixed",
            "z-10 mt-2 w-56 origin-top-right cursor-pointer rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          )}
          style={
            dashboard
              ? {}
              : {
                  left: mousePostion.x,
                  top: mousePostion.y,
                }
          }
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            // Prevent click event of a menu item from bubbling up to the menu button
            e.preventDefault();
          }}
        >
          {({ open }) => {
            !!setDropDownMenuOpen && setDropDownMenuOpen(open);
            return (
              <div className="py-1 font-normal">
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
                        // Open delete modal to confirm delete
                        setDeleteModalOpen(true);
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
                        onClick={() => {
                          void (async () => {
                            // Call remove board from folder mutation
                            await removeBoardFromFolder({
                              boardId: boardItem.id,
                              folderId: folderItem.id,
                              folderBoardOrder: folderItem.board_order,
                              rootBoardOrder:
                                boardsWithoutFolderData!.boardOrder,
                              userId: boardItem.user_id,
                            });
                            const pathParams = trimChar(
                              ["/"],
                              router.asPath
                            ).split("/");

                            // Redirect to dashboard if deleting board that is currently open
                            if (
                              pathParams[pathParams.length - 1] === boardItem.id
                            ) {
                              await router.push(`/board/${boardItem.id}`);
                            }
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
              </div>
            );
          }}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
export default BoardDropDownMenu;
