import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import BoardView from "@/components/Board/BoardView";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const UserBoardPage: NextPageWithLayout = () => {
  const { status, data: sessionData } = useSession({
    required: true,
  });
  const router = useRouter();

  // Get the board id from the slug which is the last element in the array
  const { slug } = router.query;
  const bid = slug![slug!.length - 1] as string;

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
  return <BoardView bid={bid} sessionData={sessionData} />;
};
export default UserBoardPage;

UserBoardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Test Board">{page}</AppLayout>;
};
