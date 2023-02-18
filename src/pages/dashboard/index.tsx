import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import AppLayout from "../../components/Layout/AppLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "../../server/auth";

const DashboardPage: NextPageWithLayout = () => {
  return (
    <div className="py-4">
      <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" />
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
