import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import { GetServerSideProps } from "next";
import AppLayout from "../../components/Layout/AppLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "../../server/auth";

const DashboardPage: NextPageWithLayout = () => {
  return (
    <div className="h-full p-4">
      <div className="grid h-full place-items-center rounded-lg border-4 border-dashed border-gray-200 font-bold">
        Work in progress
      </div>
    </div>
  );
};
export default DashboardPage;

DashboardPage.getLayout = (page: ReactElement) => {
  return <AppLayout title="Dashboard">{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

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
