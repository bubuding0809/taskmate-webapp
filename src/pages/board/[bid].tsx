import type { NextPageWithLayout } from "../_app";
import { ReactElement, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import AppLayout from "../../components/Layout/AppLayout";
import BoardView from "../../components/Board/BoardView";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../server/auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const UserBoardPage: NextPageWithLayout = () => {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const { bid } = router.query as { bid: string };

  return (
    <>
      {sessionData && status === "authenticated" && <BoardView bid={bid} />}
      {status === "unauthenticated" && (
        <div className="flex h-screen flex-col items-center justify-center">
          <h1 className="text-w<BoardView bid={bid} />hite text-4xl font-bold">
            You must be signed in to view this page.
          </h1>
        </div>
      )}
      {status === "loading" && (
        <div className="flex h-screen flex-col items-center justify-center">
          <h1 className="text-w<BoardView bid={bid} />hite text-4xl font-bold">
            Loading...
          </h1>
        </div>
      )}
    </>
  );
};
export default UserBoardPage;

UserBoardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Test Board">{page}</AppLayout>;
};
