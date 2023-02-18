import type { NextPageWithLayout } from "../_app";
import { ReactElement, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import AppLayout from "../../components/Layout/AppLayout";
import BoardView from "../../components/Board/BoardView";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../server/auth";
import { useSession } from "next-auth/react";

interface UserBoardPageProps {
  session: string;
  bid: string;
}
const UserBoardPage: NextPageWithLayout<UserBoardPageProps> = ({
  session,
  bid,
}) => {
  const [showBoard, setShowBoard] = useState(false);

  // Add a mandatory delay below rendering board to prevent Vercel Serverless Function from timing out
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setShowBoard(true);
    }, 500);
    return () => clearTimeout(timeOut);
  }, []);

  return (
    <>
      {showBoard ? (
        <BoardView bid={bid} />
      ) : (
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  // const session = await getServerSession(context.req, context.res, authOptions);
  const bid = context.params?.bid as string;

  if (typeof bid !== "string" || bid.length === 0) {
    return {
      notFound: true,
    };
  }

  // use timeout to simulate slow network
  const session = await new Promise((resolve) => {
    setTimeout(() => {
      return resolve("Session");
    }, 1);
  });

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
      bid,
      session,
    },
  };
};
