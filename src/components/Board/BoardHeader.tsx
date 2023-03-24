import { api } from "@/utils/api";
import useRemoveCollaborators from "@/utils/mutations/collaborator/useRemoveCollaborators";
import { UserMinusIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@mui/material";
import { User } from "@prisma/client";
import React, { useState } from "react";
import UserModal from "../Dashboard/UserModal";
import UserSearchPopover from "../Dashboard/UserSearchPopover";

interface BoardHeaderProps {
  bid: string;
  bgImage: string;
  setBgImage: React.Dispatch<React.SetStateAction<string>>;
  backgroundImages: { name: string; url: string }[];
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  bid,
  bgImage,
  setBgImage,
  backgroundImages,
}) => {
  // Query to get board data
  const { data: boardQueryData } = api.board.getBoardById.useQuery({
    boardId: bid,
  });

  // Mutation to remove collaborators from the board
  const { mutateAsync: removeCollaborators, isLoading: isRemovingUsers } =
    useRemoveCollaborators();

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  return (
    <div className="sticky top-0 z-10 flex min-w-max items-center gap-2 space-x-2 rounded-md border bg-white px-4 py-2 text-2xl font-bold shadow-md">
      <div>
        <span className="mr-2">{boardQueryData?.thumbnail_image}</span>
        {boardQueryData?.board_title}
      </div>

      {/* Show collaborators of the board */}
      <>
        <div className="flex space-x-2 font-normal">
          <div className="flex items-center gap-2">
            {boardQueryData?.Board_Collaborator.map(({ User: user }) => (
              <Tooltip
                key={user.id}
                title={user.name ?? ""}
                onClick={() => {
                  setCurrUser(user);
                  setOpenUserModal(true);
                }}
              >
                <img
                  // prevent images from being compressed
                  className="h=[26px] inline-block w-[26px] cursor-pointer rounded-full hover:opacity-75 sm:h-8 sm:w-8"
                  src={user.image ?? ""}
                  alt={user.name ?? ""}
                />
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
          actions={[
            {
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
            },
          ]}
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
