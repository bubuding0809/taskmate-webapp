import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import BoardView from "@/components/Board/BoardView";
import { useRouter } from "next/router";

const UserBoardPage: NextPageWithLayout = () => {
  const router = useRouter();

  // Get the board id from the slug which is the last element in the array
  const { slug } = router.query;
  const bid = slug![slug!.length - 1] as string;

  return <BoardView bid={bid} />;
};
export default UserBoardPage;

UserBoardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Test Board">{page}</AppLayout>;
};
