/* DONE BY: Ding RuoQian 2100971 */

import { api } from "@/utils/api";
import useRemoveCollaborators from "@/utils/mutations/collaborator/useRemoveCollaborators";
import { UserMinusIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@mui/material";
import { User } from "@prisma/client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import UserModal from "../Dashboard/UserModal";
import UserSearchPopover from "../Dashboard/UserSearchPopover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import type { EmojiType } from "@/utils/types";
import useClickAway from "@/utils/hooks/useClickAway";
import { useSession } from "next-auth/react";
import useUpdateBoardThumbnail from "@/utils/mutations/board/useUpdateBoardThumbnail";

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

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  // State to control popover for emoji picker
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  // Click away effect for folder rename input form
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickAway(wrapperRef, () => setOpenEmojiPicker(false));

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

  const boardCollaborators = useMemo(() => {
    return boardQueryData
      ? [{ User: boardQueryData.user }, ...boardQueryData.Board_Collaborator]
      : [];
  }, [boardQueryData]);

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

  return (
    <div className="sticky left-0 top-0 z-10 flex min-w-max items-center gap-2 space-x-2 rounded-md border bg-white px-4 py-2 text-2xl font-bold shadow-md">
      <div>
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
                  userId: sessionData?.user.id ?? "",
                  thumbnail: emoji.native,
                });
                setOpenEmojiPicker(false);
              }}
            />
          </div>
        )}
        {boardQueryData?.board_title}
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
