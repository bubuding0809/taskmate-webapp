import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import BoardView from "../components/Board/BoardView";

const DemoPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <Link legacyBehavior href="/">
        <a className="text-white">← Back to home</a>
      </Link>
      <BoardView bid="demo" />
    </div>
  );
};

export default DemoPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // if (typeof bid !== "string" || bid.length === 0) {
  //   return {
  //     notFound: true,
  //   };
  // }

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
    },
  };
};
