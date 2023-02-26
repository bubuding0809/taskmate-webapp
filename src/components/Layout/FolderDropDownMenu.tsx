import { Fragment, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/helper";
import useDeleteFolder from "@/utils/mutations/useDeleteFolder";
import { PencilIcon } from "@heroicons/react/24/outline";
import useClickAway from "@/utils/hooks/useClickAway";
import { api } from "@/utils/api";
import { Board } from "@prisma/client";

interface DropDownMenuProps {
  user_id: string;
  folder_id: string;
  folder_order: string[];
  folder_boards: Board[];
  setDropDownMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFolderRenameInputVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setmenuButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const FolderDropDownMenu: React.FC<DropDownMenuProps> = ({
  folder_id,
  folder_order,
  folder_boards,
  user_id,
  setDropDownMenuOpen,
  setFolderRenameInputVisible,
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
      userId: user_id,
    });

  // Mutation to delete a folder
  const { mutate: deleteFolder } = useDeleteFolder();

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
          className={`fixed z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
          style={{
            left: mousePostion.x,
            top: mousePostion.y,
          }}
        >
          {({ open }) => {
            setDropDownMenuOpen(open);
            return (
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm"
                      )}
                      onClick={(e) => {
                        setFolderRenameInputVisible(true);
                      }}
                    >
                      <PencilIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Rename
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        deleteFolder({
                          folderId: folder_id,
                          userId: user_id,
                          folderOrder: folder_order,
                          boardOrder: boardsWithoutFolderData!.boardOrder,
                          boardIdsToBeUpdated: folder_boards.map(
                            (board) => board.id
                          ),
                        });
                      }}
                    >
                      <TrashIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Delete
                    </a>
                  )}
                </Menu.Item>
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
export default FolderDropDownMenu;
