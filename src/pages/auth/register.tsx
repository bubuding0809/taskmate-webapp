import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../server/auth";
import Head from "next/head";
import { BsFacebook, BsGoogle, BsDiscord } from "react-icons/bs";
import { IconBaseProps, IconType } from "react-icons";
import Link from "next/link";
import { ReactNode } from "react";

const providerLogos: { [key: string]: IconType } = {
  Discord: BsDiscord,
  Facebook: BsFacebook,
  Google: BsGoogle,
};

export default function SignIn({
  csrfToken,
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Taskmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-blue-500">
        <div className="absolute flex w-auto space-y-8 overflow-hidden rounded-2xl  bg-white/75 px-6 py-12 shadow-sm">
          <div>
            <h2 className="mt-5 text-center text-3xl font-bold tracking-tight text-gray-900">
              {" "}
              Create your Account
            </h2>
            <div>
              <p className="mt-2 text-center text-sm text-gray-600">
                Start planning in seconds, Already have an account?
                <Link
                  href="/auth/signin"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {" "}
                  Login here
                </Link>
              </p>
            </div>

            <form
              className="mx-auto mt-10 max-w-xl sm:mt-5"
              method="post"
              action="/api/auth/callback/credentials"
            >
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="csrfToken"
                    type="hidden"
                    defaultValue={csrfToken}
                  />
                  <label
                    htmlFor="firstName"
                    className="text-m block font-semibold leading-6 text-gray-900"
                  >
                    First Name:
                    <input
                      className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      name="firstName"
                      type="text"
                      placeholder="e.g Chen Yu"
                    />
                  </label>
                  <label
                    htmlFor="email"
                    className="grid-col-2 text-m block font-semibold leading-6 text-gray-900"
                  >
                    Email:
                    <input
                      className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      name="email"
                      type="email"
                      placeholder="name@gmail.com"
                    />
                  </label>
                  <label
                    htmlFor="password"
                    className="text-m block font-semibold leading-6 text-gray-900"
                  >
                    {/* <label
                      htmlFor="username"
                      className="text-m block font-semibold leading-6 text-gray-900"
                    >
                      Username:
                      <input
                        className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        name="username"
                        type="text"
                        placeholder="chenyu99"
                      />
                    </label> */}
                    Password:
                    <input
                      className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      name="password"
                      type="password"
                      placeholder="Password"
                    />
                  </label>
                  <label
                    htmlFor="confirmPassword"
                    className="text-m block font-semibold leading-6 text-gray-900"
                  >
                    Confirm Password:
                    <input
                      className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                    />
                  </label>
                  {/* Segregation between credential and social */}
                </div>
                <div className="relative m-3 flex items-center ">
                  <div className="flex-grow border-t border-gray-600"></div>
                  <span className="mx-4 flex-shrink text-gray-600">
                    Or register with
                  </span>
                  <div className="flex-grow border-t border-gray-600"></div>
                </div>
                {/* Social Registration */}

                <div className="flex items-center justify-center ">
                  {Object.values(providers).map((provider) => {
                    const Logo = providerLogos[provider.name]!;
                    return (
                      <div key={provider.name}>
                        <button
                          className=" justify-item-stretch m-3 flex  rounded-3xl border-3 p-4 hover:bg-gray-300/50"
                          onClick={() =>
                            void signIn(provider.id, {
                              callbackUrl: "/dashboard",
                            })
                          }
                        >
                          <div className="m-1.5">
                            <Logo />
                          </div>
                          {provider.name}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="align-center flex justify-center font-semibold">
                  <button
                    className=" w-50 hover:ring- mt-4 rounded-md  border-gray-500 bg-gray-200 py-1.5 px-1.5 text-black ring-2 ring-indigo-600 hover:bg-indigo-600 hover:text-gray-100 hover:ring-0 sm:leading-6"
                    type="submit"
                  >
                    Create an account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: "/dashboard" } };
  }
  const providers = await getProviders();
  return {
    props: {
      providers: providers ?? [],
      csrfToken: await getCsrfToken(context),
    },
  };
}
