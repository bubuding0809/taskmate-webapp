import { Fragment, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/helper";
import { PencilIcon } from "@heroicons/react/24/outline";
import useClickAway from "@/utils/hooks/useClickAway";

interface DropDownMenuProps {
  setDropDownMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setMenuButtonVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  setFolderRenameInputVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dashboard?: boolean;
}

const FolderDropDownMenu: React.FC<DropDownMenuProps> = ({
  setDropDownMenuOpen,
  setFolderRenameInputVisible,
  setMenuButtonVisible,
  setDeleteModalOpen,
  dashboard,
}) => {
  // Ref for detecting click outside of drop down menu
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickAway(
    wrapperRef,
    () => !!setMenuButtonVisible && setMenuButtonVisible(false)
  );

  // Keep track of mouse position state to position the menu
  const [mousePostion, setMousePosition] = useState({ x: 0, y: 0 });

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
            "z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          )}
          style={
            dashboard
              ? {}
              : {
                  left: mousePostion.x,
                  top: mousePostion.y,
                }
          }
        >
          {({ open }) => {
            !!setDropDownMenuOpen && setDropDownMenuOpen(open);
            return (
              <div className="cursor-pointer py-1">
                <Menu.Item>
                  {({ active }) => (
                    <div
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
                    </div>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm"
                      )}
                      onClick={(e) => {
                        // Open delete modal to confirm deletion of folder
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
              </div>
            );
          }}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
export default FolderDropDownMenu;
