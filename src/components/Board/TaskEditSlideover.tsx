import { Fragment, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronDoubleRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  BellIcon,
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  UserCircleIcon as UserCircleIconMini,
} from "@heroicons/react/20/solid";
import useToggleTaskStatus from "@/utils/mutations/task/useToggleTaskStatus";
import { classNames, formatDate } from "@/utils/helper";

import type { RouterOutputs } from "@/utils/api";
import type { Optional } from "@/utils/types";

type BoardByIdOutput = RouterOutputs["board"]["getBoardById"] & {};
type Task = Optional<
  BoardByIdOutput["Panel"][number]["Task"][number],
  "subtasks"
>;
type Panel = BoardByIdOutput["Panel"][number];

// TODO - To be optimized
const formatDistanceToNow = (
  date: Date,
  options?: {
    addSuffix?: boolean;
  }
) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.round(diff / 60000);
  const diffInHours = Math.round(diff / 3600000);
  const diffInDays = Math.round(diff / 86400000);
  const diffInMonths = Math.round(diff / 2592000000);
  const diffInYears = Math.round(diff / 31536000000);

  // Calculate the buffer difference
  if (diffInYears < -12) {
    return `${-diffInYears} year${options?.addSuffix ? "s" : ""}`;
  } else if (diffInMonths < -12) {
    return `${-diffInMonths} month${options?.addSuffix ? "s" : ""}`;
  } else if (diffInDays < -30) {
    return `${-diffInDays} day${options?.addSuffix ? "s" : ""}`;
  } else if (diffInHours < -12) {
    return `${-diffInHours} hour${options?.addSuffix ? "s" : ""}`;
  } else if (diffInMinutes < -60) {
    return `${-diffInMinutes} minute${options?.addSuffix ? "s" : ""}`;
  }

  // Calculate the overdue difference
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${options?.addSuffix ? "s" : ""}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${options?.addSuffix ? "s" : ""}`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${options?.addSuffix ? "s" : ""}`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${options?.addSuffix ? "s" : ""}`;
  } else {
    return `${diffInYears} year${options?.addSuffix ? "s" : ""}`;
  }
};

const activity = [
  {
    id: 1,
    type: "comment",
    person: { name: "Eduardo Benz", href: "#" },
    imageUrl:
      "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. ",
    date: "6d ago",
  },
  {
    id: 2,
    type: "assignment",
    person: { name: "Hilary Mahy", href: "#" },
    assigned: { name: "Kristin Watson", href: "#" },
    date: "2d ago",
  },
  {
    id: 3,
    type: "tags",
    person: { name: "Hilary Mahy", href: "#" },
    tags: [
      { name: "Bug", href: "#", color: "bg-rose-500" },
      { name: "Accessibility", href: "#", color: "bg-indigo-500" },
    ],
    date: "6h ago",
  },
  {
    id: 4,
    type: "comment",
    person: { name: "Jason Meyers", href: "#" },
    imageUrl:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.",
    date: "2h ago",
  },
  {
    id: 5,
    type: "tags",
    person: { name: "Hilary Mahy", href: "#" },
    tags: [
      { name: "Bug", href: "#", color: "bg-rose-500" },
      { name: "Accessibility", href: "#", color: "bg-indigo-500" },
      { name: "Alert", href: "#", color: "bg-red-500" },
    ],
    date: "6h ago",
  },
  {
    id: 6,
    type: "comment",
    person: { name: "Jason Meyers", href: "#" },
    imageUrl:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.",
    date: "2h ago",
  },
  {
    id: 7,
    type: "comment",
    person: { name: "Jason Meyers", href: "#" },
    imageUrl:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.",
    date: "2h ago",
  },
];

interface TaskEditSlideoverProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  task: Task;
  panel: Panel;
}

const TaskEditSlideover: React.FC<TaskEditSlideoverProps> = ({
  open,
  setOpen,
  task,
  panel,
}) => {
  // Mutation to toggle task completion
  const { mutate: toggleTask } = useToggleTaskStatus();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        {/* Overlay */}
        <div className="fixed inset-0" />

        {/* Slideover */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-4xl">
                  <div className="overlay flex h-full flex-col border-l bg-white shadow-md">
                    {/* Header */}
                    <div className="sticky top-0 z-10 border-y bg-white px-4 py-2 shadow-sm sm:px-6">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className={classNames(
                            "inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-110 active:shadow-md"
                          )}
                          onClick={() =>
                            toggleTask({
                              boardId: panel.board_id,
                              panelId: panel.id,
                              taskId: task.id,
                              parentTaskId: task.parentTaskId,
                              completed: !task.is_completed,
                            })
                          }
                        >
                          <CheckCircleIcon
                            className={classNames(
                              task.is_completed && "bg-white text-teal-600",
                              "-ml-0.5 h-5 w-5 rounded-full transition-all duration-500 ease-in-out"
                            )}
                            aria-hidden="true"
                          />
                          {task.is_completed
                            ? "Completed"
                            : "Mark as completed"}
                        </button>
                        {/* <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Edit task
                        </Dialog.Title> */}
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <ChevronDoubleRightIcon
                              className="h-6 w-6"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Main */}
                    <main className="flex-1">
                      <div className="py-8">
                        <div className="max-w-3xl px-4 sm:px-6 lg:px-8 xl:grid xl:max-w-5xl xl:grid-cols-3">
                          <div className="xl:col-span-2 xl:border-r xl:border-gray-200 xl:pr-8">
                            <div>
                              {/* Title and meta info*/}
                              <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
                                <div>
                                  <h1 className="text-2xl font-bold text-gray-900">
                                    {task.task_title}
                                  </h1>
                                  <p className="mt-2 text-sm text-gray-500">
                                    Created by{" "}
                                    <a
                                      href="#"
                                      className="font-medium text-gray-900"
                                    >
                                      {task.Creator?.name}
                                    </a>{" "}
                                    in{" "}
                                    <a
                                      href="#"
                                      className="font-medium text-gray-900"
                                    >
                                      {panel.panel_title}
                                    </a>
                                    {task.parentTaskId && (
                                      <>
                                        {" "}
                                        under{" "}
                                        <a
                                          href="#"
                                          className="font-medium text-gray-900"
                                        >
                                          {task.parentTask?.task_title}
                                        </a>
                                      </>
                                    )}
                                  </p>
                                </div>
                                <div className="mt-4 flex space-x-3 md:mt-0">
                                  <button
                                    type="button"
                                    className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  >
                                    <BellIcon
                                      className="-ml-0.5 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    Subscribe
                                  </button>
                                </div>
                              </div>

                              {/* Inline items from sidebar, only visible in xl and above */}
                              <aside className="mt-8 xl:hidden">
                                <h2 className="sr-only">Details</h2>
                                <div className="space-y-5">
                                  <div className="flex items-center space-x-2">
                                    <ChatBubbleLeftEllipsisIcon
                                      className="h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      {
                                        activity.filter(
                                          (item) => item.type === "comment"
                                        ).length
                                      }{" "}
                                      comments
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <CalendarIcon
                                      className="h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      Created on{" "}
                                      <time dateTime="2020-12-02">
                                        Dec 2, 2020
                                      </time>
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-6 space-y-8 border-b border-t border-gray-200 py-6">
                                  <div>
                                    <h2 className="text-sm font-medium text-gray-500">
                                      Assignees
                                    </h2>
                                    <ul role="list" className="mt-3 space-y-3">
                                      <li className="flex justify-start">
                                        <a
                                          href="#"
                                          className="flex items-center space-x-3"
                                        >
                                          <div className="flex-shrink-0">
                                            <img
                                              className="h-5 w-5 rounded-full"
                                              src="https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80"
                                              alt=""
                                            />
                                          </div>
                                          <div className="text-sm font-medium text-gray-900">
                                            Eduardo Benz
                                          </div>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h2 className="text-sm font-medium text-gray-500">
                                      Tags
                                    </h2>
                                    <ul role="list" className="mt-2 leading-8">
                                      <li className="inline">
                                        <a
                                          href="#"
                                          className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                          <div className="absolute flex flex-shrink-0 items-center justify-center">
                                            <span
                                              className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                              aria-hidden="true"
                                            />
                                          </div>
                                          <div className="ml-3 text-xs font-semibold text-gray-900">
                                            Bug
                                          </div>
                                        </a>{" "}
                                      </li>
                                      <li className="inline">
                                        <a
                                          href="#"
                                          className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                          <div className="absolute flex flex-shrink-0 items-center justify-center">
                                            <span
                                              className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                              aria-hidden="true"
                                            />
                                          </div>
                                          <div className="ml-3 text-xs font-semibold text-gray-900">
                                            Accessibility
                                          </div>
                                        </a>{" "}
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </aside>

                              {/* Description */}
                              <div className="py-3 xl:pb-0 xl:pt-6">
                                <h2 className="sr-only">Description</h2>
                                <div className="prose max-w-none">
                                  <p>
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Expedita, hic? Commodi
                                    cumque similique id tempora molestiae
                                    deserunt at suscipit, dolor voluptatem,
                                    numquam, harum consequatur laboriosam
                                    voluptas tempore aut voluptatum alias?
                                  </p>
                                  <ul role="list">
                                    <li>
                                      Tempor ultrices proin nunc fames nunc ut
                                      auctor vitae sed. Eget massa parturient
                                      vulputate fermentum id facilisis nam
                                      pharetra. Aliquet leo tellus.
                                    </li>
                                    <li>
                                      Turpis ac nunc adipiscing adipiscing metus
                                      tincidunt senectus tellus.
                                    </li>
                                    <li>
                                      Semper interdum porta sit tincidunt. Dui
                                      suspendisse scelerisque amet metus eget
                                      sed. Ut tellus in sed dignissim.
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Activity section */}
                            <section
                              aria-labelledby="activity-title"
                              className="mt-8 xl:mt-10"
                            >
                              <div>
                                <div className="divide-y divide-gray-200">
                                  <div className="pb-4">
                                    <h2
                                      id="activity-title"
                                      className="text-lg font-medium text-gray-900"
                                    >
                                      Activity
                                    </h2>
                                  </div>
                                  <div className="pt-6">
                                    {/* Activity feed*/}
                                    <div className="flow-root">
                                      <ul role="list" className="-mb-8">
                                        {activity.map((item, itemIdx) => (
                                          <li key={item.id}>
                                            <div className="relative pb-8">
                                              {itemIdx !==
                                              activity.length - 1 ? (
                                                <span
                                                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                                                  aria-hidden="true"
                                                />
                                              ) : null}
                                              <div className="relative flex items-start space-x-3">
                                                {item.type === "comment" ? (
                                                  <>
                                                    <div className="relative">
                                                      <img
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
                                                        src={item.imageUrl}
                                                        alt=""
                                                      />

                                                      <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                                                        <ChatBubbleLeftEllipsisIcon
                                                          className="h-5 w-5 text-gray-400"
                                                          aria-hidden="true"
                                                        />
                                                      </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                      <div>
                                                        <div className="text-sm">
                                                          <a
                                                            href={
                                                              item.person.href
                                                            }
                                                            className="font-medium text-gray-900"
                                                          >
                                                            {item.person.name}
                                                          </a>
                                                        </div>
                                                        <p className="mt-0.5 text-sm text-gray-500">
                                                          Commented {item.date}
                                                        </p>
                                                      </div>
                                                      <div className="mt-2 text-sm text-gray-700">
                                                        <p>{item.comment}</p>
                                                      </div>
                                                    </div>
                                                  </>
                                                ) : item.type ===
                                                  "assignment" ? (
                                                  <>
                                                    <div>
                                                      <div className="relative px-1">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                                          <UserCircleIconMini
                                                            className="h-5 w-5 text-gray-500"
                                                            aria-hidden="true"
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1 py-1.5">
                                                      <div className="text-sm text-gray-500">
                                                        <a
                                                          href={
                                                            item.person.href
                                                          }
                                                          className="font-medium text-gray-900"
                                                        >
                                                          {item.person.name}
                                                        </a>{" "}
                                                        assigned{" "}
                                                        <a
                                                          href={
                                                            item.assigned?.href
                                                          }
                                                          className="font-medium text-gray-900"
                                                        >
                                                          {item.assigned?.name}
                                                        </a>{" "}
                                                        <span className="whitespace-nowrap">
                                                          {item.date}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </>
                                                ) : (
                                                  <>
                                                    <div>
                                                      <div className="relative px-1">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                                          <TagIcon
                                                            className="h-5 w-5 text-gray-500"
                                                            aria-hidden="true"
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1 py-0">
                                                      <div className="text-sm leading-8 text-gray-500">
                                                        <span className="mr-0.5">
                                                          <a
                                                            href={
                                                              item.person.href
                                                            }
                                                            className="font-medium text-gray-900"
                                                          >
                                                            {item.person.name}
                                                          </a>{" "}
                                                          added tags
                                                        </span>{" "}
                                                        <span className="mr-0.5">
                                                          {item.tags?.map(
                                                            (tag) => (
                                                              <Fragment
                                                                key={tag.name}
                                                              >
                                                                <a
                                                                  href={
                                                                    tag.href
                                                                  }
                                                                  className="relative inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                                >
                                                                  <span className="absolute flex flex-shrink-0 items-center justify-center">
                                                                    <span
                                                                      className={classNames(
                                                                        tag.color,
                                                                        "h-1.5 w-1.5 rounded-full"
                                                                      )}
                                                                      aria-hidden="true"
                                                                    />
                                                                  </span>
                                                                  <span className="ml-3 font-semibold text-gray-900">
                                                                    {tag.name}
                                                                  </span>
                                                                </a>{" "}
                                                              </Fragment>
                                                            )
                                                          )}
                                                        </span>
                                                        <span className="whitespace-nowrap">
                                                          {item.date}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="mt-6">
                                      <div className="flex space-x-3">
                                        <div className="flex-shrink-0">
                                          <div className="relative">
                                            <img
                                              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
                                              src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80"
                                              alt=""
                                            />

                                            <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                                              <ChatBubbleLeftEllipsisIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <form action="#">
                                            <div>
                                              <label
                                                htmlFor="comment"
                                                className="sr-only"
                                              >
                                                Comment
                                              </label>
                                              <textarea
                                                id="comment"
                                                name="comment"
                                                rows={3}
                                                className="block w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:py-1.5 sm:text-sm sm:leading-6"
                                                placeholder="Leave a comment"
                                                defaultValue={""}
                                              />
                                            </div>
                                            <div className="mt-6 flex items-center justify-end space-x-4">
                                              <button
                                                type="button"
                                                className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                              >
                                                <CheckCircleIcon
                                                  className="-ml-0.5 h-5 w-5 text-green-500"
                                                  aria-hidden="true"
                                                />
                                                Close issue
                                              </button>
                                              <button
                                                type="submit"
                                                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                              >
                                                Comment
                                              </button>
                                            </div>
                                          </form>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </section>
                          </div>

                          {/* Sidebar */}
                          <aside className="top-14 hidden h-max xl:sticky xl:block xl:pl-8">
                            <h2 className="sr-only">Details</h2>
                            <div className="space-y-5">
                              {task.due_datetime && (
                                <div className="flex items-center space-x-2">
                                  <ClockIcon
                                    className={classNames(
                                      Date.now() > task.due_datetime.getTime()
                                        ? "text-red-500"
                                        : "text-emerald-500",
                                      "h-5 w-5"
                                    )}
                                    aria-hidden="true"
                                  />
                                  <span className="text-sm font-medium text-gray-900">
                                    {Date.now() >
                                    task.due_datetime.getTime() ? (
                                      <span className="text-red-500">
                                        Overdue by{" "}
                                        {formatDistanceToNow(
                                          task.due_datetime,
                                          {
                                            addSuffix: true,
                                          }
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-green-500">
                                        Due in{" "}
                                        {formatDistanceToNow(
                                          task.due_datetime,
                                          {
                                            addSuffix: true,
                                          }
                                        )}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <ChatBubbleLeftEllipsisIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {
                                    activity.filter(
                                      (item) => item.type === "comment"
                                    ).length
                                  }{" "}
                                  comments
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  Created on{" "}
                                  <time
                                    dateTime={task.created_at.toISOString()}
                                  >
                                    {task.created_at.toLocaleDateString(
                                      "en-SG",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                      }
                                    )}
                                  </time>
                                </span>
                              </div>
                            </div>
                            <div className="mt-6 space-y-8 border-t border-gray-200 py-6">
                              <div>
                                <h2 className="text-sm font-medium text-gray-500">
                                  Assignees
                                </h2>
                                <ul role="list" className="mt-3 space-y-3">
                                  <li className="flex justify-start">
                                    <a
                                      href="#"
                                      className="flex items-center space-x-3"
                                    >
                                      <div className="flex-shrink-0">
                                        <img
                                          className="h-5 w-5 rounded-full"
                                          src="https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80"
                                          alt=""
                                        />
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        Eduardo Benz
                                      </div>
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h2 className="text-sm font-medium text-gray-500">
                                  Tags
                                </h2>
                                <ul role="list" className="mt-2 leading-8">
                                  <li className="inline">
                                    <a
                                      href="#"
                                      className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                      <div className="absolute flex flex-shrink-0 items-center justify-center">
                                        <span
                                          className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                          aria-hidden="true"
                                        />
                                      </div>
                                      <div className="ml-3 text-xs font-semibold text-gray-900">
                                        Bug
                                      </div>
                                    </a>{" "}
                                  </li>
                                  <li className="inline">
                                    <a
                                      href="#"
                                      className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                      <div className="absolute flex flex-shrink-0 items-center justify-center">
                                        <span
                                          className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                          aria-hidden="true"
                                        />
                                      </div>
                                      <div className="ml-3 text-xs font-semibold text-gray-900">
                                        Accessibility
                                      </div>
                                    </a>{" "}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </aside>
                        </div>
                      </div>
                    </main>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TaskEditSlideover;
