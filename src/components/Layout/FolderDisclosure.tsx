import { Disclosure, Popover } from "@headlessui/react";
import { useRef, useEffect, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import { classNames } from "../../utils/helper";
import Link from "next/link";
import { Board, Folder } from "@prisma/client";
import DropDownMenu from "./DropDownMenu";
import { api } from "@/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import useRenameFolder from "@/utils/mutations/useRenameFolder";

interface FolderDisclosureProps {
  folderItem: Folder & {
    boards: Board[];
  };
  sidebarExpanded: boolean;
  folder_order: string[];
}

const FolderDisclosure: React.FC<FolderDisclosureProps> = ({
  folderItem,
  sidebarExpanded,
  folder_order,
}) => {
  const [menuButtonVisible, setmenuButtonVisible] = useState(false);
  const [dropDownMenuOpen, setDropDownMenuOpen] = useState(false);
  const [folderRenameInputVisible, setFolderRenameInputVisible] =
    useState(false);
  const [renameInputValue, setRenameInputValue] = useState(
    folderItem.folder_name
  );

  // // Set up autoAnimation of list element
  // const parent = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   parent.current && autoAnimate(parent.current);
  // }, [parent]);

  // Effect for setting rename input value to folder name when clicked away
  useEffect(() => {
    setRenameInputValue(folderItem.folder_name);
  }, [folderRenameInputVisible, folderItem.folder_name]);

  // Hook to detect click outside of rename input form
  function useOutsideAlerter(ref: React.RefObject<HTMLDivElement>) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;
        if (ref.current && !ref.current.contains(target)) {
          setFolderRenameInputVisible(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useOutsideAlerter(wrapperRef);

  const { mutate: renameFolder } = useRenameFolder();

  return (
    <Disclosure
      as="div"
      key={folderItem.id}
      className="space-y-1"
      onMouseEnter={() => setmenuButtonVisible(true)}
      onMouseLeave={() => !dropDownMenuOpen && setmenuButtonVisible(false)}
    >
      {({ open }) => (
        <div
          className="relative"
          // ref={parent}
        >
          {/* Folder name input form*/}
          {folderRenameInputVisible && (
            <div
              ref={wrapperRef}
              className="form-input absolute z-30 w-60 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600"
            >
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-900"
              >
                folder name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="form-input block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                placeholder="Jane Smith"
                value={renameInputValue}
                onChange={(e) => setRenameInputValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  // Close input form on enter or escape
                  if (e.key === "Enter" || e.key === "Escape") {
                    setFolderRenameInputVisible(false);
                  }

                  // Persist new name to folder on enter
                  if (e.key === "Enter") {
                    renameFolder({
                      userId: folderItem.user_id,
                      folderId: folderItem.id,
                      newName: renameInputValue,
                    });
                  }
                }}
                autoFocus
              />
            </div>
          )}
          {menuButtonVisible && sidebarExpanded && (
            <div className="absolute right-8 top-3">
              <DropDownMenu
                folder_id={folderItem.id}
                user_id={folderItem.user_id}
                folder_order={folder_order}
                setDropDownMenuOpen={setDropDownMenuOpen}
                setFolderRenameInputVisible={setFolderRenameInputVisible}
              />
            </div>
          )}

          {/* Folder main */}
          <Disclosure.Button className="group flex w-full flex-col items-center rounded-md p-2 text-left text-sm font-medium text-gray-300  hover:bg-gray-700 hover:text-white focus:outline-none">
            <div className="flex w-full items-center justify-center">
              {/* Fixed position dropdown menu button */}

              {/* Folder thumbnail image */}
              <span
                className={classNames(
                  sidebarExpanded ? "mr-3" : "mr-0",
                  "text-xl"
                )}
              >
                {folderItem.thumbnail_image}
              </span>

              {/* Folder Name */}
              {sidebarExpanded && (
                <>
                  <p className="flex-1 truncate">{folderItem.folder_name}</p>
                  <svg
                    className={classNames(
                      open ? "rotate-90 text-gray-400" : "text-gray-300",
                      "ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400"
                    )}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                  </svg>
                </>
              )}
            </div>
          </Disclosure.Button>

          {/* Children projects */}
          {sidebarExpanded && (
            <Disclosure.Panel className="space-y-1">
              {folderItem.boards.map((board) => (
                <Link href={`/board/${board.id}`} key={board.id}>
                  <button className="group flex w-full items-center justify-start rounded-md py-2 pl-11 pr-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none">
                    <span
                      className={classNames(
                        sidebarExpanded ? "mr-3" : "mr-0",
                        "text-xl"
                      )}
                    >
                      {board.thumbnail_image}
                    </span>
                    {sidebarExpanded && (
                      <p className="flex-1 truncate text-start">
                        {board.board_title}
                      </p>
                    )}
                  </button>
                </Link>
              ))}
            </Disclosure.Panel>
          )}
        </div>
      )}
    </Disclosure>
  );
};

export default FolderDisclosure;
