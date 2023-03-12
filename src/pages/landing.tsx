import React, { useRef, useEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { animated } from "@react-spring/web";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { ClassNames } from "@emotion/react";
import { positions } from "@mui/system";
import { BsFacebook, BsInstagram, BsTwitter, BsGithub } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// TO BE DONE BY: Jansonn
// This is the landing page for the app. It should be the first page that the user sees when they visit the site.
// The page can be accessed at http://localhost:3000/landing
const navigation = [
    { name: "About Us", href: "#" },
    { name: "Features", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Log In", href: "/auth/signin" },
  ],
  social = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=100090745762601",
      icon: <BsFacebook />,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/hello.taskmate?igshid=YmMyMTA2M2Y=",
      icon: <BsInstagram />,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/hello_taskmate?s=11&t=F6-j-o7xmaTvCe3F-h3PrQ",
      icon: <BsTwitter />,
    },
    {
      name: "GitHub",
      href: "https://www.github.com/",
      icon: <BsGithub />,
    },
  ],
  people = [
    {
      name: "Ding Ruoqian",
      role: "Software Architect",
      image: "./images/ding.jpg",
    },
    {
      name: "Jansonn Lim",
      role: "Frontend Developer",
      image: "./images/jansonn.jpg",
    },
    {
      name: "Chua Chen yu",
      role: "Frontend Developer",
      image: "./images/chenyu.jpg",
    },
    {
      name: "Amri Bin Mohd Sazali",
      role: "Project Manager , Backend Developer",
      image: "./images/puren.jpg",
    },
    {
      name: "Chua Jin Tian",
      role: "UI/UX Designer , Frontend Developer",
      image: "./images/jake.jpg",
    },
  ],
  features = [
    {
      header: "Track Your Task Easily",
      description:
        "Manage any type of project with our powerful task management system. Create, assign, and track tasks with ease.",
      image: "./images/calendar.jpg",
    },
    {
      header: "Collaborate With Your Team",
      description:
        "Work together with your team to complete projects faster. Share files, chat, and more.",
      image: "./images/kanban.jpg",
    },
    {
      header: "Stay Organized",
      description:
        "Stay organized with our powerful task management system. Create, assign, and track tasks with ease.",
      image: "./images/planning.jpg",
    },
    {
      header: "Ideal Workspace",
      description:
        "Build your very own workspace with our powerful task management system. Create, assign, and track tasks with ease.",
      image: "./images/teamplan.jpg",
    },
  ];

const LandingPage: NextPage = () => {
  const ref = useRef();

  const slideLeft = () => {
    let slider: HTMLElement = document.getElementById("slider")!;
    slider.scrollLeft = slider.scrollLeft - 500;
  };

  const slideRight = () => {
    let slider: HTMLElement = document.getElementById("slider")!;
    slider.scrollLeft = slider.scrollLeft + 500;
  };

  return (
    <>
      <Head>
        <title>Taskmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white">
        {/* navbar */}
        <div>
          <nav className="sticky top-0 flex bg-white opacity-80 ">
            <div>
              <img
                className="hidden h-20 justify-center md:flex md:w-36 "
                src="./images/TaskMate.png"
                alt="logo"
              />
            </div>
            <div>
              <img
                className="flex h-16 justify-center md:hidden md:w-36 "
                src="./images/Tmlogo.png"
                alt="logo"
              />
            </div>
            <div className="my-5 ml-auto mr-10 space-x-8 text-right">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:text-[#B97E7E] md:text-xl"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </nav>

          {/* hero section */}
          <div className="mx-auto max-w-7xl animate-fade py-24 px-6 sm:py-32 lg:px-8">
            <h2 className="text-center text-6xl font-bold tracking-tight text-[#595e64] sm:text-8xl">
              New Generation
              <br />
              <span className="text-[#CEAAAA]">Task Manager</span>
            </h2>
            <br />
            <div className="ml-2">
              <span className="flex justify-center text-center text-2xl text-[#000000] sm:text-3xl">
                The New All-In-One Project Management
              </span>
              <span className="flex justify-center text-2xl text-black sm:text-3xl">
                Catered For Your Team
              </span>
            </div>

            <div className="mt-10 flex items-center justify-center gap-x-3">
              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="rounded-md bg-[#BD9999] px-3.5 py-2.5 text-2xl text-white shadow-sm  hover:bg-[#b17e7e]"
              >
                Try Now
              </a>
              <a
                href="#"
                className="rounded-md bg-[#D9D9D9] px-3.5 py-2.5 text-2xl text-black shadow-sm hover:bg-[#c6c3c3]"
              >
                Live Demo
              </a>
            </div>
          </div>

          {/* features */}
          <div className="mt-20 mb-8 flex snap-x snap-mandatory items-center gap-52 overflow-x-scroll py-10 px-5 scrollbar-none md:pl-36">
            {/* <ul>
              {features.map((item) => (
                <li
                  key={item.header}
                  className="sm:1/3 mr-72 flex h-96 flex-none snap-end items-center rounded-lg bg-[#f8efef] pl-10 shadow-md md:ml-36 md:w-2/3"
                >
                  <img
                    className="mx-auto h-48 w-48 md:h-56 md:w-56"
                    src={item.image}
                    alt=""
                  />
                  <h3 className="mt-6 block text-base font-semibold leading-7 tracking-tight text-[#595e64]">
                    {item.header}
                  </h3>
                  <p className="block text-sm leading-6 text-gray-400">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul> */}

            <div className="w-5/5 flex h-40 flex-none snap-end items-center rounded-lg bg-[#f8efef] px-5 shadow-md md:mr-72 md:ml-32 md:h-80 md:w-4/6 md:pl-10">
              <div>
                <img
                  className="hidden md:mt-8 md:flex md:w-52"
                  src="./images/calendar.jpg"
                  alt="calendar"
                />
              </div>
              <div className="md:mt-10 md:ml-5">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  <span className="block text-[#595e64]">
                    Track Your Task Easily
                  </span>
                </h1>
                <div className="mt-3 ml-2 text-[#CDAAAA] md:text-xl">
                  <p>Manage any type of project more efficiently.</p>
                  <p>No separate, clunky system</p>
                </div>
              </div>
            </div>

            <div className="w-5/5 flex h-40 flex-none snap-center items-center rounded-lg bg-[#f8efef] px-5 shadow-md md:mr-24  md:h-80 md:w-4/6 md:pb-4">
              <div className="pl-3 md:ml-5">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  <span className="block text-[#595e64]">
                    Fully Customisable
                  </span>
                </h1>
                <div className="mt-2 text-[#CDAAAA] md:text-xl">
                  <p>Create your own labels, tags, owners, and more, </p>
                  <p>where everyone has context.</p>
                  <p>Everything stays organized.</p>
                </div>
              </div>
              <div className="hidden pl-4 md:flex">
                <img src="./images/kanban.jpg" className="w-56" />
              </div>
            </div>

            <div className="flex h-40 w-4/5 flex-none snap-center items-center rounded-lg bg-[#f8efef] px-5 shadow-md  md:h-80 md:w-4/6 md:pb-4">
              <div className="hidden md:flex">
                <img src="./images/planning.jpg" className="w-64" />
              </div>
              <div className="md:ml-10">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  <span className="block text-[#595e64]">Plan accordingly</span>
                </h1>
                <div className="mt-1 text-[#CDAAAA] md:mt-5 md:text-xl">
                  <p>Work With Team</p>
                  <p>With No Communication</p>
                </div>
              </div>
            </div>

            <div className="mr-60 flex h-40 w-4/5 flex-none snap-center items-center rounded-lg bg-[#f8efef] px-5 shadow-md md:ml-24 md:h-80 md:w-2/3 md:pb-4">
              <div className="md:mr-10 md:ml-10 md:mt-8">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  <span className="block text-[#595e64]">Ideal Workspace</span>
                </h1>
                <div className="mt-2 text-[#CDAAAA] md:text-xl">
                  <p>Build custom roadmaps and Gantt charts </p>
                  <p>so you monitor everything from the start.</p>
                </div>
              </div>
              <div className="hidden md:flex md:pl-4">
                <img src="./images/teamplan.jpg" className="w-64" />
              </div>
            </div>
          </div>

          {/* team */}
          <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  Meet our team
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                  We are a dynamic group of individuals who are passionate about
                  what we do.
                </p>
              </div>
              <ul
                role="list"
                className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8"
              >
                {people.map((person) => (
                  <li
                    key={person.name}
                    className="rounded-2xl bg-[#F8EFEF] py-10 px-8"
                  >
                    <img
                      className="mx-auto h-48 w-48 rounded-full md:h-56 md:w-56"
                      src={person.image}
                      alt=""
                    />
                    <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-[#595e64]">
                      {person.name}
                    </h3>
                    <p className="text-sm leading-6 text-gray-400">
                      {person.role}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* footer */}
          <footer>
            <div className="mx-auto max-w-7xl py-12 px-6 md:flex md:items-center md:justify-between lg:px-8">
              <div className="flex justify-center space-x-6 md:order-2">
                {social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-2xl text-gray-500 hover:text-[#B97E7E]"
                  >
                    <span>{item.icon}</span>
                  </a>
                ))}
              </div>
              <div className="order-1 mt-8 md:mt-0">
                <p className="text-center text-sm text-gray-500">
                  &copy; 2023 TaskMate, Inc. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
