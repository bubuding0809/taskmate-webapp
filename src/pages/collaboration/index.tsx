/* DONE BY: Ding RuoQian 2100971 */

import type { NextPageWithLayout } from "../_app";
import { ReactElement, useEffect, useRef, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Board from "@/components/dashboard/Board";

const CollaborationPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: sessionData, status } = useSession();

  // Query to get all boards that the user is a collaborator of
  const { data: sharedBoardsQueryData } =
    api.board.getUserCollaboratorBoards.useQuery(
      {
        userId: sessionData?.user.id ?? "",
      },
      {
        enabled: !!sessionData?.user.id,
      }
    );

  // Return loading screen while session is loading
  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="h-full py-4">
        {/* Shared boards and teams */}
        <section aria-labelledby="folders-title" className="bg-transparent">
          {/* H2 for screen reader only */}
          <h2 className="sr-only" id="folders-title">
            Shared boards and teams
          </h2>

          {/* Grid for shared boards and teams */}
          <div className="grid gap-4 overflow-x-auto">
            {/* Shared boards */}
            <div className="z-0 col-span-full flex flex-col gap-4 overflow-x-auto bg-white px-4 py-4">
              <div className="col-span-full flex justify-between">
                <h2 className="col-span-full flex items-center indent-2 text-3xl font-semibold">
                  📚 Shared
                </h2>
              </div>

              <div className="col-span-full flex flex-grow gap-2 overflow-x-auto p-1">
                {/* shared boards */}
                {
                  // Map through all shared board maps
                  [...(sharedBoardsQueryData?.values() ?? [])].map(
                    (boardItem) => (
                      <Board
                        key={boardItem.id}
                        boardItem={boardItem}
                        className="border"
                      />
                    )
                  )
                }
              </div>
            </div>

            {/* Teams */}
            <div className="z-0 col-span-full grid grid-cols-1 gap-4 bg-white px-4 py-4 2xl:grid-cols-2">
              <div className="col-span-full flex justify-between">
                <h2 className="indent-2 text-3xl font-semibold">🗂️ Teams</h2>
              </div>

              {/* Teams goes here */}
              <div className="p-1" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default CollaborationPage;

CollaborationPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Collaboration">{page}</AppLayout>;
};
