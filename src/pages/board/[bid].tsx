import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import AppLayout from "../../components/Layout/AppLayout";
import BoardView from "../../components/Board/BoardView";
import { Session } from "next-auth";

interface UserBoardPageProps {
  session: Session;
  bid: string;
}
const UserBoardPage: NextPageWithLayout<UserBoardPageProps> = ({
  session,
  bid,
}) => {
  return <BoardView bid={bid} />;
};
export default UserBoardPage;

UserBoardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Test Board">{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { bid } = context.query;
  console.log(bid);

  if (typeof bid !== "string" || bid.length === 0) {
    return {
      notFound: true,
    };
  }

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      bid,
    },
  };
};
