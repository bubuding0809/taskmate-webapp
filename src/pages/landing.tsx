import React, { useRef, useEffect, useState, Fragment } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { ClassNames } from "@emotion/react";
import { positions } from "@mui/system";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsGithub,
  BsLinkedin,
} from "react-icons/bs";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

// TO BE DONE BY: Jansonn
// This is the landing page for the app. It should be the first page that the user sees when they visit the site.
// The page can be accessed at http://localhost:3000/landing
const navigation = [
    { name: "About Us", href: "#aboutus" },
    { name: "Features", href: "#feature" },
    { name: "Contact", href: "#contacts" },
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
      href: "https://github.com/bubuding0809/taskmate-webapp",
      icon: <BsGithub />,
    },
  ],
  people = [
    {
      name: "Ding Ruoqian",
      role: "Software Architect",
      image: "./images/ding.jpg",
      icon: <BsInstagram />,
      igurl: "https://www.instagram.com/ruoqianbubu/",
      linkedurl: "https://www.linkedin.com/in/ruoqian-ding-270329175",
      icon2: <BsLinkedin />,
    },
    {
      name: "Jansonn Lim",
      role: "Frontend Developer",
      image: "./images/jansonn.jpg",
      icon: <BsInstagram />,
      igurl: "https://www.instagram.com/nikubaoo/",
      linkedurl: "https://www.linkedin.com/in/jansonn-lim-071705145/",
      icon2: <BsLinkedin />,
    },
    {
      name: "Chua Chen yu",
      role: "Frontend Developer",
      image: "./images/chenyu.jpg",
      icon: <BsInstagram />,
      igurl: "https://www.instagram.com/chenyu.ig/",
      linkedurl: "https://www.linkedin.com/mwlite/in/chua-chen-yu-880b62143",
      icon2: <BsLinkedin />,
    },
    {
      name: "Amri Bin Mohd Sazali",
      role: "Project Manager , Backend Developer",
      image: "./images/Amri.JPG",
      icon: <BsInstagram />,
      igurl: "https://www.instagram.com/amri_sazali/",
      linkedurl: "https://www.linkedin.com/in/amrisazali",
      icon2: <BsLinkedin />,
    },
    {
      name: "Chua Jin Tian",
      role: "UI/UX Designer , Frontend Developer",
      image: "./images/jake.jpg",
      icon: <BsInstagram />,
      igurl: "https://instagram.com/naitnijauhc?igshid=ZDdkNTZiNTM=",
      linkedurl: "https://www.linkedin.com/in/jake-chua-37ba4026a/",
      icon2: <BsLinkedin />,
    },
  ],
  features = [
    {
      header: "Track Your Task Easily",
      description:
        "Manage any type of project with our powerful task management system.",
      description2: "Create, assign, and track tasks with ease.",
      image: "./images/calendar.jpg",
    },
    {
      id: 2,
      header: "Collaborate With Your Team",
      description: "Work together with your team to complete projects faster.",
      description2: "Share files, chat, and more.",
      image: "./images/kanban.jpg",
    },
    {
      id: 3,
      header: "Stay Organized",
      description: "Stay organized with our powerful task management system.",
      description2: "Create, assign, and track tasks with ease.",
      image: "./images/planning.jpg",
    },
    {
      id: 4,
      header: "Ideal Workspace",
      description:
        "Build your very own workspace with our powerful task management system. ",
      description2: "Create, assign, and track tasks with ease.",
      image: "./images/teamplan.jpg",
    },
  ];

const LandingPage: NextPage = () => {
  const home = useRef<HTMLDivElement>(null);
  const aboutus = useRef<HTMLDivElement>(null);
  const feature = useRef<HTMLDivElement>(null);
  const contacts = useRef<HTMLDivElement>(null);
  const [navbar, setNavbar] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    message: "",
  });

  const changeBackground = () => {
    if (window.scrollY >= 70) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, [navbar]);

  const [currSection, setCurrSection] = useState(0);

  useEffect(() => {
    const sectionRef = [home, aboutus, feature, contacts];
    sectionRef[currSection]!.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [currSection]);

  const [open, setOpen] = useState(false);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  const onContactFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm({ ...contactForm, [name]: value });
  };

  return (
    <>
      <Head>
        <title>Taskmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* navbar */}

      <div className="">
        <nav
          className={
            navbar
              ? "sticky top-0 z-20 flex bg-indigo-700  "
              : "navbar flex bg-transparent"
          }
        >
          <div>
            <img
              className="hidden aspect-auto h-10 md:flex md:w-36 "
              src="./images/TaskMate_White_2.png"
              alt="logo"
            />
          </div>
          <div>
            <img
              className="flex aspect-auto h-10 md:hidden md:w-36 "
              src="./images/logo_white_2.png"
              alt="logo"
            />
          </div>
          <div className="mr-5 mt-2 ml-auto flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={
                  navbar
                    ? "text-xs font-medium text-white hover:text-black  md:flex md:text-base"
                    : "text-xs font-medium text-white hover:text-indigo-600  md:flex md:text-base"
                }
              >
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* hero section */}
        <div ref={home} className="z-1 mx-auto py-20">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
            alt=""
            className="absolute inset-0 -z-10 h-full w-full bg-slate-900 object-cover"
          />
          <div className="animate-fade">
            <h2 className="text-center text-6xl font-bold tracking-tight text-white sm:text-8xl">
              New Generation
              <br />
              <span className="text-indigo-600">Task Manager</span>
            </h2>
            <br />
            <div className="ml-2">
              <span className="flex justify-center text-center text-2xl text-white sm:text-3xl">
                The New All-In-One Project Management
              </span>
              <span className="flex justify-center text-2xl text-white sm:text-3xl">
                Catered For Your Team
              </span>
            </div>

            <div className="mt-10 flex items-center justify-center gap-x-3">
              <a
                href="/auth/signin"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-2xl text-white shadow-sm  hover:bg-indigo-400"
              >
                Try Now
              </a>
              <a
                href="/demo"
                className="rounded-md bg-white px-3.5 py-2.5 text-2xl text-black shadow-sm hover:bg-[#c6c3c3]"
              >
                Live Demo
              </a>
            </div>
          </div>
        </div>
        {/* features */}
        <Carousel
          swipeable={true}
          draggable={true}
          responsive={responsive}
          ssr={true} // means to render carousel on server-side.
          infinite={false}
          keyBoardControl={true}
          containerClass="carousel-container"
          itemClass="carousel-item-padding-40-px"
          className="z-10 bg-gray-900 px-5 py-10"
          removeArrowOnDeviceType={["tablet", "mobile"]}
        >
          <div id="feature" ref={feature}>
            <div className="mr-10 flex items-center justify-center rounded-md bg-indigo-600 shadow-lg">
              <div className="my-10 mx-2 flex">
                <img
                  className="mr-10 h-36 w-36 md:h-52 md:w-52"
                  src="./images/calendar.jpg"
                  alt="logo"
                />
                <div className="flex-row">
                  <h1 className="text-2xl font-bold text-white md:mt-4">
                    Task Management
                  </h1>
                  <p className="mt-2 flex text-white">
                    Manage your tasks and projects with ease
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="mr-10 flex items-center justify-center rounded-md bg-indigo-600 shadow-lg">
              <div className="my-10 mx-2 flex">
                <div className="flex-row">
                  <h1 className="block text-2xl font-bold text-white md:mt-4">
                    Ideal Workspace
                  </h1>
                  <p className="mt-2 text-white">
                    Create your own workspace and invite your team
                  </p>
                </div>
                <img
                  className="ml-10 h-36 w-36 md:h-52 md:w-52"
                  src="./images/kanban.jpg"
                  alt="logo"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="mr-10 flex items-center justify-center rounded-md bg-indigo-600 shadow-lg">
              <div className="my-10 mx-2 flex">
                <img
                  className="mr-10 h-36 w-36 md:h-52 md:w-52"
                  src="./images/teamplan.jpg"
                  alt="logo"
                />
                <div className="flex-row">
                  <h1 className="block text-2xl font-bold text-white md:mt-10">
                    Track Your Task Easily
                  </h1>
                  <p className="mt-2 flex  text-white">
                    Manage your tasks and projects with ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="mr-10  flex items-center justify-center rounded-md bg-indigo-600 shadow-lg">
              <div className="my-10 flex">
                <div className="ml-5 flex-row">
                  <h1 className="block text-2xl font-bold text-white md:mt-8">
                    Plan accordingly
                  </h1>
                  <p className="mt-2 flex text-white">
                    Work with team with no miscommunication.
                  </p>
                </div>
                <img
                  className="ml-10 mr-4 h-36 w-36 md:h-52 md:w-52"
                  src="./images/planning.jpg"
                  alt="logo"
                />
              </div>
            </div>
          </div>
        </Carousel>

        {/* About Us */}
        <div id="aboutus" ref={aboutus} className=" bg-gray-900 py-16">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Meet our team
              </h2>
              <p className="mt-4 text-lg leading-8 text-indigo-300">
                We are a dynamic group of individuals who are passionate about
                what we do.
              </p>
            </div>
            <ul
              role="list"
              className="mx-auto mt-20 grid max-w-2xl grid-flow-row grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8"
            >
              {people.map((person) => (
                <li
                  key={person.name}
                  className="rounded-2xl bg-gray-800 py-10 px-8"
                >
                  <img
                    className="mx-auto h-52 w-52 rounded-full object-cover"
                    src={person.image}
                    alt=""
                  />
                  <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-white">
                    {person.name}
                  </h3>
                  <p className="text-sm leading-6 text-gray-400">
                    {person.role}
                  </p>
                  <div className="flex justify-center space-x-2">
                    <a
                      href={person.igurl}
                      className="text-2xl text-white hover:text-indigo-500"
                    >
                      <p className="mt-2 flex justify-center">{person.icon}</p>
                    </a>
                    <a
                      href={person.linkedurl}
                      className="text-2xl text-white hover:text-indigo-500"
                    >
                      <p className="mt-2 flex justify-center">{person.icon2}</p>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Contact Us */}
        <div id="contacts" ref={contacts} className="bg-gray-900 py-5">
          <div className="mx-auto max-w-7xl  text-start">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Contact Us
              </h2>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              const sendContactForm = async () => {
                const res = await fetch(
                  "https://taskmate-webapp.vercel.app/api/email",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(contactForm),
                  }
                );
                return (await res.json()) as Promise<{ message: string }>;
              };
              event.preventDefault();

              // Make request to backend
              sendContactForm()
                .then((res) => {
                  console.log("Frontend received: ", res);

                  // Open the modal to show success
                  setOpen(true);

                  // Reset the form
                  setContactForm({
                    firstName: "",
                    lastName: "",
                    phoneNo: "",
                    email: "",
                    message: "",
                  });
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
            className="mx-auto mt-10 max-w-xl px-2 "
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-semibold leading-6 text-white"
                >
                  First name
                </label>
                <div className="mt-2.5">
                  <input
                    required
                    type="text"
                    name="firstName"
                    id="first-name"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    value={contactForm.firstName}
                    onChange={onContactFormChange}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-semibold leading-6 text-white"
                >
                  Last name
                </label>
                <div className="mt-2.5">
                  <input
                    required
                    type="text"
                    name="lastName"
                    id="last-name"
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    value={contactForm.lastName}
                    onChange={onContactFormChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold leading-6 text-white"
                >
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    required
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 sm:text-sm sm:leading-6"
                    value={contactForm.email}
                    onChange={onContactFormChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="phone-number"
                  className="flex text-sm font-semibold leading-6 text-white"
                >
                  Phone number <p className="text-gray-400">(optional)</p>
                </label>
                <div className="mt-2.5">
                  <input
                    type="tel"
                    name="phoneNo"
                    id="phone-number"
                    autoComplete="tel"
                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 sm:text-sm sm:leading-6"
                    value={contactForm.phoneNo}
                    onChange={onContactFormChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold leading-6 text-white"
                >
                  Message
                </label>
                <div className="mt-2.5">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 sm:text-sm sm:leading-6"
                    value={contactForm.message}
                    onChange={onContactFormChange}
                    placeholder="Write your message here"
                  />
                </div>
              </div>
            </div>
            <div className="mt-10">
              <button
                type="submit"
                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  hover:bg-indigo-500"
              >
                Submit
              </button>
            </div>
          </form>

          <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setOpen}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                      <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
                          <CheckIcon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Submission received!
                          </Dialog.Title>

                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              We have received your submission! We will get back
                              to you as soon as possible.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:bg-indigo-500"
                          onClick={() => setOpen(false)}
                        >
                          Thanks!
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>
        </div>
        {/* footer */}
        <footer className="bg-gray-900">
          <div className="mx-auto max-w-7xl py-12 px-6 md:flex md:items-center md:justify-between lg:px-8">
            <div className="flex justify-center space-x-6 md:order-2">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-2xl text-white hover:text-indigo-500"
                >
                  <span>{item.icon}</span>
                </a>
              ))}
            </div>
            <div className="order-1 mt-8 md:mt-0">
              <p className="text-center text-sm text-white">
                &copy; 2023 TaskMate, Inc. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
