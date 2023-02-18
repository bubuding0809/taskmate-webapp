import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import { GetServerSideProps } from "next";
import AppLayout from "../../components/Layout/AppLayout";
import BoardView from "../../components/Board/BoardView";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../server/auth";

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
  const session = await getServerSession(context.req, context.res, authOptions);
  const { bid } = context.query;

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
      // session,
      bid,
    },
  };
};
