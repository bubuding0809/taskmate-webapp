import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../server/auth";
import Head from "next/head";

// TO BE DONE BY: Chen Yu
// This is the sign in page for the app. It should be the page that the user sees when they press get started or sign in.
// You can access the page at http://localhost:3000/auth/signin
// You can also access the page by clicking the sign in button on the landing page.
// The page should display a list of sign in options. For now, we only have discord.
// To add more sign in options, you can refer to the documentation here: https://next-auth.js.org/getting-started/client
// You can also refer to the documentation here: https://next-auth.js.org/getting-started/example
// You can also refer to the documentation here: https://next-auth.js.org/getting-started/client
// You can customize the authentication providers in the server/auth.ts file.

const SignIn: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  return (
    <>
      {/* Meta data goes here */}
      <Head>
        <title>Taskmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Your content goes here */}
      <div className="flex min-h-screen items-center justify-center">
        {Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button
              className="rounded-md border-2 p-4 hover:bg-gray-300/50"
              onClick={() =>
                void signIn(provider.id, { callbackUrl: "/dashboard" })
              }
            >
              Sign in with {provider.name}
            </button>
          </div>
        ))}
      </div>
      {/* You content goes here */}
    </>
  );
};
export default SignIn;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/landing" } };
  }
  console.log("running getServerSideProps");
  const providers = await getProviders();
  console.log("Where are my providers", providers);

  return {
    props: { providers: providers ?? [] },
  };
}