import React, { useEffect } from "react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  LinkIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { nanoid } from "nanoid";

import type { PanelWithTasks } from "server/api/routers/board";
import useCreateTask from "@/utils/mutations/task/useCreateTask";
import { handlePusherUpdate } from "@/utils/pusher";
import { useSession } from "next-auth/react";

interface TaskCreationModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  panelItem: PanelWithTasks;
}

const team: {
  name: string;
  email: string;
  href: string;
  imageUrl: string;
}[] = [
  // {
  //   name: "Tom Cook",
  //   email: "tom.cook@example.com",
  //   href: "#",
  //   imageUrl:
  //     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  // },
];

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  open,
  setOpen,
  panelItem,
}) => {
  const { data: sessionData } = useSession();
  const cancelButtonRef = useRef(null);

  const [newTaskForm, setNewTaskForm] = useState<{
    task_title: string;
    task_description: string;
    task_start_dt: string;
    task_end_dt: string;
    task_due_dt: string;
  }>({
    task_title: "",
    task_description: "",
    task_start_dt: "",
    task_end_dt: "",
    task_due_dt: "",
  });

  const { mutate: createTask } = useCreateTask();

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      task_title,
      task_description,
      task_start_dt,
      task_end_dt,
      task_due_dt,
    } = newTaskForm;

    // Ensure that the todoMessage is not empty
    if (!task_title.trim()) {
      alert("Enter a task mate");
      return;
    }

    // Update active list with new item
    const newTaskId = nanoid();
    const rootTasks = panelItem.Task.filter((task) => !task.parentTaskId);
    const postTaskOrder = rootTasks.length ? rootTasks[0]!.order : 0;

    // Mutation to add new task to panel
    createTask(
      {
        boardId: panelItem.board_id,
        panelId: panelItem.id,
        taskId: newTaskId,
        postTaskOrder: postTaskOrder,
        title: task_title,
        details: task_description,
        startDate: task_start_dt.length > 0 ? new Date(task_start_dt) : null,
        endDate: task_end_dt.length > 0 ? new Date(task_end_dt) : null,
        dueDate: task_due_dt.length > 0 ? new Date(task_due_dt) : null,
      },
      {
        onSuccess: () =>
          handlePusherUpdate({
            bid: panelItem.board_id,
            sender: sessionData!.user.id,
          }),
      }
    );

    setOpen(false);

    //reset newEntry form
    setNewTaskForm({
      task_title: "",
      task_description: "",
      task_start_dt: "",
      task_end_dt: "",
      task_due_dt: "",
    });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg border-2 border-gray-400 bg-white text-left shadow-solid-medium shadow-slate-800/50 transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="space-y-1">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        New task
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Get started by filling in the information below to
                        create your new task.
                      </p>
                    </div>
                    <div className="flex h-7 items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setOpen(false)}
                        tabIndex={-1} // Prevents the button from being focused when the modal opens
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <form
                  className="flex h-full flex-col px-4 pb-4 sm:p-6"
                  onSubmit={handleSubmit}
                >
                  {/* Main */}
                  <div className="flex-1">
                    {/* Divider container */}
                    <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                      {/* Task title */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                          >
                            Task title <span className="text-red-600">*</span>
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            required
                            type="text"
                            name="task_title"
                            id="task_title"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Give your task a title"
                            value={newTaskForm.task_title}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>

                      {/* Task description */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="project-description"
                            className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                          >
                            Description
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            name="task_description"
                            id="task_description"
                            rows={3}
                            className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                            placeholder="Write a few sentences about the task."
                            value={newTaskForm.task_description}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>

                      {/* Task dates */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="project-description"
                            className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                          >
                            Due date
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="datetime-local"
                            name="task_due_dt"
                            id="task_due_dt"
                            className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                            placeholder="Write a few sentences about the task."
                            value={newTaskForm.task_due_dt}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>

                      {/* Task assignees */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <h3 className="text-sm font-medium leading-6 text-gray-900">
                            Task assignees
                          </h3>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex space-x-2">
                            {team?.map((person) => (
                              <a
                                key={person.email}
                                href={person.href}
                                className="flex-shrink-0 rounded-full hover:opacity-75"
                              >
                                <img
                                  className="inline-block h-8 w-8 rounded-full"
                                  src={person.imageUrl}
                                  alt={person.name}
                                />
                              </a>
                            ))}

                            <button
                              type="button"
                              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              <span className="sr-only">Add team member</span>
                              <PlusIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          setOpen(false);
                          // Clear the form
                          setNewTaskForm({
                            task_title: "",
                            task_description: "",
                            task_start_dt: "",
                            task_end_dt: "",
                            task_due_dt: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TaskCreationModal;
