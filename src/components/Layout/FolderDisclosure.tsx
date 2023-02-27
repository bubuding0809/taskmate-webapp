import { Disclosure } from "@headlessui/react";
import { useRef, useEffect, useState } from "react";
import { classNames } from "../../utils/helper";
import Link from "next/link";
import { Board, Folder } from "@prisma/client";
import DropDownMenu from "./FolderDropDownMenu";
import useRenameFolder from "@/utils/mutations/useRenameFolder";
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import useClickAway from "@/utils/hooks/useClickAway";
import { Bars2Icon } from "@heroicons/react/24/outline";
import autoAnimate from "@formkit/auto-animate";
import BoardDisclosure from "./BoardDisclosure";
import { FolderWithBoards } from "server/api/routers/folder";

interface FolderDisclosureProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  folderItem: FolderWithBoards;
  sidebarExpanded: boolean;
  folder_order: string[];
}

const FolderDisclosure: React.FC<FolderDisclosureProps> = ({
  provided,
  snapshot,
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

  // Effect for setting rename input value to folder name when clicked away
  useEffect(() => {
    setRenameInputValue(folderItem.folder_name);
  }, [folderRenameInputVisible, folderItem.folder_name]);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setFolderRenameInputVisible(false));

  // Set up autoAnimation of folder boards element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // Rename folder mutation
  const { mutate: renameFolder } = useRenameFolder();

  return (
    <Disclosure
      as="div"
      key={folderItem.id}
      className={classNames(
        snapshot.isDragging &&
          "rounded border-3 border-slate-400 bg-slate-50/80 bg-slate-700 shadow-solid-small shadow-gray-900",
        "rounded-md border border-dashed border-gray-200 bg-gray-600/10"
      )}
      onMouseEnter={() => setmenuButtonVisible(true)}
      onMouseLeave={() => !dropDownMenuOpen && setmenuButtonVisible(false)}
      ref={provided.innerRef}
      {...provided.draggableProps}
    >
      {({ open, close }) => (
        <div className="relative">
          {/* Folder name input form, is postioned fixed */}
          {folderRenameInputVisible && (
            <div
              ref={wrapperRef}
              className="form-input absolute z-30 w-60 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600"
            >
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-900"
              >
                Rename folder
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

          {/* Folder main */}
          <Disclosure.Button
            as="div"
            className="group flex w-full flex-col items-center rounded-md p-2 text-left text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
          >
            <div className="flex w-full cursor-pointer items-center justify-center">
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
                  <p
                    className={classNames(
                      snapshot.isDragging && "text-white",
                      "flex-1 truncate"
                    )}
                  >
                    {folderItem.folder_name}
                  </p>
                  {/* Fixed position dropdown menu button */}
                  {sidebarExpanded && (
                    <div
                      className={classNames(
                        menuButtonVisible ? "visible" : "invisible",
                        "flex"
                      )}
                    >
                      <DropDownMenu
                        folder_id={folderItem.id}
                        folder_order={folder_order}
                        folder_boards={Object.values(folderItem.boards)}
                        user_id={folderItem.user_id}
                        setDropDownMenuOpen={setDropDownMenuOpen}
                        setFolderRenameInputVisible={
                          setFolderRenameInputVisible
                        }
                        setmenuButtonVisible={setmenuButtonVisible}
                      />
                      <div {...provided.dragHandleProps}>
                        <Bars2Icon
                          className="h-5 w-5 text-gray-400"
                          onMouseDown={() => close()}
                        />
                      </div>
                    </div>
                  )}
                  <svg
                    className={classNames(
                      open ? "rotate-90 text-gray-400" : "text-gray-300",
                      "ml-2 h-5 w-5 flex-shrink-0 transform cursor-pointer transition-colors duration-150 ease-in-out group-hover:text-gray-400"
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
            <Disclosure.Panel className="space-y-1" ref={parent}>
              <Droppable droppableId={folderItem.id} type="nested-boards">
                {(provided, snapshot) => {
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="pl-5 pb-2 pr-2"
                    >
                      {folderItem.board_order?.map((boardId, index) => (
                        <Draggable
                          key={`nested-board-${boardId}`}
                          draggableId={`nested-board-${boardId}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <BoardDisclosure
                              boardItem={folderItem.boards.get(boardId)!}
                              folderItem={folderItem}
                              provided={provided}
                              snapshot={snapshot}
                              sidebarExpanded={sidebarExpanded}
                            />
                          )}
                        </Draggable>
                      ))}
                      {folderItem.board_order.length === 0 && (
                        <div
                          className={classNames(
                            snapshot.isDraggingOver && "bg-slate-800",
                            "flex h-12 items-center justify-center rounded-md border border-dashed border-gray-500"
                          )}
                        >
                          <p className="text-sm text-white">Add a board here</p>
                        </div>
                      )}
                      {folderItem.board_order.length > 0 &&
                        provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </Disclosure.Panel>
          )}
        </div>
      )}
    </Disclosure>
  );
};

export default FolderDisclosure;
