// You do not need to touch this page. Unless you want to make changes to the layout of the app.
/* DONE BY: Ding RuoQian 2100971 */

import { type AppType, AppProps } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";
import "animate.css";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { ToastContextProvider } from "@/utils/context/ToastContext";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = {
  Component: NextPageWithLayout;
  pageProps: { session: Session; pageProps: object };
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <SessionProvider session={session}>
      {/* Provide toast context to app */}
      <ToastContextProvider duration={3000}>
        {getLayout(<Component {...pageProps} />)}
      </ToastContextProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
