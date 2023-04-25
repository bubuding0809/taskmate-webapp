/* DONE BY: Ding RuoQian 2100971 */

import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import { useRouter } from "next/router";
import BoardView from "@/components/board/BoardView";
import AppLayout from "@/components/layout/AppLayout";

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
