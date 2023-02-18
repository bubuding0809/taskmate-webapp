import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  BellIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { classNames } from "../../utils/helper";
import FolderDisclosure from "../../components/Layout/FolderDisclosure";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  { name: "Teams", href: "#", icon: UsersIcon, current: false },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

const folderNavigation = [
  {
    name: "School",
    href: "#",
    icon: "🌡️",
    children: [
      { name: "Math", href: "#", icon: "🧮" },
      { name: "Science", href: "#", icon: "🧪" },
      { name: "English", href: "#", icon: "📚" },
      { name: "History", href: "#", icon: "📜" },
      { name: "Art", href: "#", icon: "🎨" },
    ],
  },
  {
    name: "Work",
    href: "#",
    icon: "🧪",
    children: [
      { name: "Design", href: "#", icon: "🎨" },
      { name: "Engineering", href: "#", icon: "🔧" },
      { name: "Marketing", href: "#", icon: "📈" },
    ],
  },
  {
    name: "Personal",
    href: "#",
    icon: "🔑",
    children: [
      { name: "Recipes", href: "#", icon: "🍲" },
      { name: "Travel", href: "#", icon: "✈️" },
      { name: "Reminders", href: "#", icon: "📝" },
    ],
  },
  { name: "Archives", href: "#", icon: "📦", children: [] },
  {
    name: "This is a very long name, what will happen if the name is long?",
    href: "#",
    icon: "🧬",
    children: [],
  },
];

const DashboardPage: NextPage = () => {
  // Set up sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set up sidebar expand state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <>
      <div className="flex h-screen">
        {/* Dynamic side bar for mobile, able to show and hide*/}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            {/* Overlay element */}
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            {/* Sidebar element */}
            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-gray-300"
                                : "text-gray-400 group-hover:text-gray-300",
                              "mr-4 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop, able to expand and retract */}
        <div
          className={classNames(
            sidebarExpanded ? "md:w-64" : "md:w-20",
            "hidden w-full transition-all ease-in-out md:relative md:inset-y-0 md:flex md:flex-col "
          )}
        >
          {/* Expand Sidebar button */}
          <button
            className={classNames(
              sidebarExpanded ? "left-[15.25rem]" : "left-[4.25rem]",
              "absolute top-12 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white"
            )}
            onClick={() => setSidebarExpanded((prev) => !prev)}
          >
            <span className="sr-only">Open sidebar</span>
            {sidebarExpanded ? (
              <ChevronLeftIcon className="text- h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Sidebar content*/}
          <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
            {/* Logo area */}
            <div
              className={classNames(
                sidebarExpanded ? "justify-start" : "justify-center",
                "flex h-16 flex-shrink-0 items-center bg-gray-900 px-4"
              )}
            >
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                alt="Taskmate"
              />
            </div>

            {/* Nav */}
            <nav className="flex flex-1 flex-col space-y-8 overflow-y-auto px-2 py-4">
              {/* Navigation content */}
              <div className="space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      sidebarExpanded ? "" : "justify-center",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300",
                        sidebarExpanded ? "mr-3" : "mr-0",
                        "h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {sidebarExpanded && item.name}
                  </a>
                ))}
              </div>

              {/* Projects content */}
              <div
                className={classNames(
                  !sidebarExpanded && "items-center",
                  "flex flex-1 flex-col space-y-1 overflow-y-auto"
                )}
              >
                <h3
                  className={classNames(
                    sidebarExpanded && "px-3",
                    "text-sm font-medium text-gray-500"
                  )}
                  id="projects-headline"
                >
                  Projects
                </h3>
                <div
                  className="overlay w-full space-y-1"
                  role="group"
                  aria-labelledby="projects-headline"
                >
                  {folderNavigation.map((item) =>
                    !item.children ? (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          !sidebarExpanded && "justify-center",
                          "group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <span
                          className={classNames(
                            sidebarExpanded ? "mr-3" : "mr-0",
                            "text-xl"
                          )}
                        >
                          {item.icon}
                        </span>

                        {sidebarExpanded && (
                          <p className="truncate">{item.name}</p>
                        )}
                      </a>
                    ) : (
                      <FolderDisclosure
                        sidebarExpanded={sidebarExpanded}
                        item={item}
                        key={item.name}
                      />
                    )
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main content*/}
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            {/* Sidebar toggle, controls the 'sidebarOpen' sidebar state. Only in mobile mode*/}
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Top Nav */}
            <div className="flex flex-1 items-center justify-between gap-2 px-4">
              <h1 className="hidden text-2xl font-semibold text-gray-900 md:block">
                Dashboard
              </h1>

              {/* Search bar */}
              <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="w-full max-w-lg lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
              </div>

              {/* Notifcation and profile */}
              <div className="flex items-center md:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          {/* Main content goes here */}
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8"></div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                <div className="py-4">
                  <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" />
                </div>
                {/* /End replace */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

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
