/* DONE BY: Ding RuoQian 2100971 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { UserMinusIcon } from "@heroicons/react/24/solid";
import { IconButton, Tooltip } from "@mui/material";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Save } from "@mui/icons-material";
import useClickAway from "@/utils/hooks/useClickAway";
import useRemoveCollaborators from "@/utils/mutations/collaborator/useRemoveCollaborators";
import useUpdateBoardThumbnail from "@/utils/mutations/board/useUpdateBoardThumbnail";
import useUpdateBoardTitle from "@/utils/mutations/board/useUpdateBoardTitle";
import UserModal from "@/components/modal/UserModal";
import UserSearchPopover from "@/components/dashboard/UserSearchPopover";
import { api } from "@/utils/api";
import { classNames } from "@/utils/helper";

import type { User } from "@prisma/client";
import type { EmojiType } from "@/utils/types";

interface BoardHeaderProps {
  bid: string;
  bgImage: string;
  setBgImage: React.Dispatch<React.SetStateAction<string>>;
  backgroundImages: { name: string; url: string }[];
  onlineUsers: Set<string>;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  bid,
  bgImage,
  setBgImage,
  backgroundImages,
  onlineUsers,
}) => {
  const { data: sessionData } = useSession();

  // Query to get board data
  const { data: boardQueryData } = api.board.getBoardById.useQuery({
    boardId: bid,
  });

  // Mutation to remove collaborators from the board
  const { mutateAsync: removeCollaborators, isLoading: isRemovingUsers } =
    useRemoveCollaborators();

  // Mutation to update board thumbnail image
  const { mutate: updateBoardThumbnail } = useUpdateBoardThumbnail();

  // Mutation to update board title
  const { mutate: updateBoardTitle } = useUpdateBoardTitle();

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  // State to control popover for emoji picker
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  // State to control edit board name
  const [boardTitle, setBoardTitle] = useState(
    boardQueryData?.board_title ?? ""
  );
  const [editBoardName, setEditBoardName] = useState(false);
  const [isAnimateError, setIsAnimateError] = useState(false);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setOpenEmojiPicker(false));

  // Effect to add event listener for escape key when emoji picker is open
  useEffect(() => {
    const escapeListner = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenEmojiPicker(false);
      }
    };

    if (openEmojiPicker) {
      document.addEventListener("keydown", escapeListner);
    }

    return () => document.removeEventListener("keydown", escapeListner);
  }, [openEmojiPicker]);

  // Memoized array of board collaborators
  const boardCollaborators = useMemo(() => {
    return boardQueryData
      ? [{ User: boardQueryData.user }, ...boardQueryData.Board_Collaborator]
      : [];
  }, [boardQueryData]);

  // Memoized array of user modal actions
  const userModalActions = useMemo(() => {
    const actions = [];

    if (currUser?.id !== boardQueryData?.user_id) {
      actions.push({
        callback: async () => {
          await removeCollaborators({
            boardId: bid,
            userIds: [currUser?.id ?? ""],
          });
          return true;
        },
        loading: isRemovingUsers,
        name: "Remove collaborator",
        icon: UserMinusIcon,
      });
    }

    return actions;
  }, [boardQueryData, currUser]);

  // Handle save board name
  const handleSaveBoardName = (e: React.FormEvent) => {
    e.preventDefault();

    // If the board name is empty, animate the input field
    if (!boardTitle.trim()) {
      setIsAnimateError(true);
      setTimeout(() => {
        setIsAnimateError(false);
      }, 1000);
      return;
    }

    // Mutation update board title
    updateBoardTitle({
      boardId: bid,
      title: boardTitle,
      userId: boardQueryData?.user_id ?? "",
    });

    // Close edit board name
    setEditBoardName(false);
  };

  return (
    <div className="sticky left-0 top-0 z-10 flex min-w-max items-center gap-2 space-x-2 rounded-md border bg-white px-4 py-2 text-2xl font-bold shadow-md">
      <div className="flex">
        {/* Board thumb nail */}
        <span
          className="mr-2 cursor-pointer"
          onClick={() => setOpenEmojiPicker((prev) => !prev)}
        >
          {boardQueryData?.thumbnail_image}
        </span>

        {/* Emoji picker to edit board thumb nail */}
        {openEmojiPicker && (
          <div
            ref={wrapperRef}
            className="absolute top-12 left-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji: EmojiType) => {
                updateBoardThumbnail({
                  boardId: bid,
                  userId: boardQueryData?.user_id ?? "",
                  thumbnail: emoji.native,
                });
                setOpenEmojiPicker(false);
              }}
            />
          </div>
        )}

        {/* Edit board name */}
        {editBoardName ? (
          // Panel title edit form
          <form
            className={classNames(
              isAnimateError && "animate__headShake",
              "animate__animated"
            )}
            onSubmit={handleSaveBoardName}
          >
            <div className="relative" ref={wrapperRef}>
              <input
                autoFocus
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 pr-9 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-2xl sm:leading-6"
                placeholder="Folder name"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyUp={(e) => {
                  if (e.key === "Escape") {
                    setEditBoardName(false);
                  }
                }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 5,
                }}
                size="small"
                onClick={handleSaveBoardName}
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
          <Tooltip title="Double-click to edit board name">
            <h3
              className="cursor-pointer truncate text-2xl font-semibold text-gray-900"
              onDoubleClick={() => {
                if (boardQueryData?.board_title) {
                  setBoardTitle(boardQueryData.board_title);
                }
                setEditBoardName(true);
              }}
            >
              {boardQueryData?.board_title}
            </h3>
          </Tooltip>
        )}
      </div>

      {/* Show collaborators of the board */}
      <>
        <div className="flex space-x-2 font-normal">
          <div className="flex items-center gap-2">
            {boardCollaborators.map(({ User: user }) => (
              <Tooltip
                key={user.id}
                title={user.name ?? ""}
                className="relative"
                onClick={() => {
                  setCurrUser(user);
                  setOpenUserModal(true);
                }}
              >
                <div className="h=[26px] relative inline-block w-[26px] sm:h-8 sm:w-8">
                  {
                    // Show a green dot if the user is online
                    onlineUsers.has(user.id) && (
                      <div className="absolute -right-1 top-0 h-2.5 w-2.5 rounded-full border bg-emerald-400" />
                    )
                  }

                  <img
                    // prevent images from being compressed
                    className="cursor-pointer rounded-full hover:opacity-75"
                    src={
                      user.image ??
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                    }
                    alt={user.name ?? ""}
                  />
                </div>
              </Tooltip>
            ))}
          </div>
          <UserSearchPopover bid={bid} />
        </div>

        {/* Only shown when collaborator avatar is clicked */}
        <UserModal
          open={openUserModal}
          setOpen={setOpenUserModal}
          user={currUser}
          actions={userModalActions}
        />
      </>

      {/* Create a select dropdown to choose background images */}
      <div className="flex items-center gap-2">
        <select
          className="rounded-md border-gray-300 text-sm text-gray-500 focus:border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          onChange={(e) => {
            setBgImage(e.target.value);
          }}
          value={bgImage}
          id="bg-image"
        >
          {backgroundImages.map((image) => {
            return (
              <option key={image.url} value={image.url}>
                {image.name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default BoardHeader;
