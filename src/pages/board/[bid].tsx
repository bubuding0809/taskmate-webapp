import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import BoardView from "@/components/Board/BoardView";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const UserBoardPage: NextPageWithLayout = () => {
  const { status } = useSession({ required: true });
  const router = useRouter();
  const { bid } = router.query as { bid: string };

  // Return loading screen while session is loading
  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-w<BoardView bid={bid} />hite text-4xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  // Only allow the user to view their own boards when logged in
  return <BoardView bid={bid} />;
};
export default UserBoardPage;

UserBoardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Test Board">{page}</AppLayout>;
};
