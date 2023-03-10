// import { GetServerSideProps } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../server/auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BoardView from "../components/Board/BoardView";

const DemoPage: React.FC = () => {
  const { data: sessionData } = useSession();
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <Link legacyBehavior href="/">
        <a className="text-white">← Back to home</a>
      </Link>
      <BoardView bid="a4e8ecd8-ba6a-11ed-9704-025df7c84b2c" />
    </div>
  );
};

export default DemoPage;

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session) {
//     return {
//       redirect: {
//         destination: "/api/auth/signin",
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {
//       session,
//     },
//   };
// };
