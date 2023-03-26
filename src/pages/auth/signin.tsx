import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
  signIn,
  useSession,
} from "next-auth/react";
import Head from "next/head";
import { BsFacebook, BsGoogle, BsDiscord } from "react-icons/bs";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import Loader from "@/components/custom/Loader";
import { BuiltInProviderType } from "next-auth/providers";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

// TO BE DONE BY: Chen Yu
// This is the sign in page for the app. It should be the page that the user sees when they press get started or sign in.
// You can access the page at http://localhost:3000/auth/signin
// You can also access the page by clicking the sign in button on the landing page.
// The page should display a list of sign in options. For now, we only have discord.
// To add more sign in options, you can refer to the documentation here: https://next-auth.js.org/getting-started/client
// You can also refer to the documentation here: https://next-auth.js.org/getting-started/example
// You can also refer to the documentation here: https://next-auth.js.org/getting-started/client
// You can customize the authentication providers in the server/auth.ts file.

const providerLogos: { [key: string]: IconType } = {
  Discord: BsDiscord,
  Facebook: BsFacebook,
  Google: BsGoogle,
};

const SignIn: NextPage = () => {
  const router = useRouter();
  const { data: sessionData, status } = useSession();

  const [providers, setProviders] = useState<Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null>();

  useEffect(() => {
    if (sessionData) {
      void router.push("/dashboard");
    }
  }, [sessionData]);

  useEffect(() => {
    void getProviders()
      .then((providers) => setProviders(providers))
      .catch((err) => console.log(err));
  }, []);

  const [credientialForm, setCredientialForm] = useState({
    email: "",
    password: "",
  });

  if (status === "loading" || status === "authenticated") {
    return <Loader />;
  }

  return (
    <>
      {/* Meta data goes here */}
      <Head>
        <title>Taskmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/*NEW*/}
      <div>
        {/* Background Video */}
        <video
          src="/bg-vid.mp4"
          autoPlay
          loop
          muted
          className="fixed top-0 left-0 z-0 min-h-full min-w-full object-cover"
        />
        <div className="flex min-h-screen items-center justify-center">
          {/* Container Glassmorphism */}
          <div className="absolute w-full max-w-md space-y-8 rounded-3xl bg-white/75 px-6 py-12 shadow-md ">
            {/*Header Text*/}
            <img className="mx-auto h-12 w-auto" src="../main.png" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              {" "}
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or
              <Link
                href="/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {" "}
                Click here to Register
              </Link>
            </p>

            {/*Credential Login*/}
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                void signIn("credentials", {
                  ...credientialForm,
                  callbackUrl: "/dashboard",
                  redirect: false,
                })
                  .then((res) => {
                    if (res?.error) {
                      throw new Error(res.error);
                    }
                    res?.ok && void router.push("/dashboard");
                  })
                  .catch((err) => {
                    console.log(err);
                    alert("Invalid Credentials");
                  });
              }}
            >
              <input type="hidden" name="remember" value="true" />
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="email-address" className="sr-only rounded">
                    {" "}
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Email address"
                    value={credientialForm.email}
                    onChange={(e) => {
                      setCredientialForm({
                        ...credientialForm,
                        email: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    {" "}
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Password"
                    value={credientialForm.password}
                    onChange={(e) => {
                      setCredientialForm({
                        ...credientialForm,
                        password: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    {/*locklogo*/}
                    <svg
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  Sign in
                </button>
              </div>
            </form>

            <div className="relative flex items-center ">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="mx-4 flex-shrink text-gray-600">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Social Login */}
            <div className="flex items-center justify-between">
              {Object.values(providers ?? {})
                .filter((provider) => provider.name !== "Credentials")
                .map((provider) => {
                  const Logo = providerLogos[provider.name]!;
                  return (
                    <button
                      key={provider.name}
                      className="flex w-32 items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 shadow hover:bg-gray-300/50"
                      onClick={() =>
                        void signIn(provider.id, {
                          callbackUrl: "/dashboard",
                        })
                      }
                    >
                      <Logo className="text-indigo-800" />
                      {provider.name}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* You content goes here */}
    </>
  );
};
export default SignIn;
