/* DONE BY: Ding RuoQian 2100971 */

import React from "react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { nanoid } from "nanoid";
import useCreateTask from "@/utils/mutations/task/useCreateTask";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { Tooltip } from "@mui/material";
import UserModal from "@/components/Modal/UserModal";
import AssigneeSelectPopover from "../Board/AssigneeSelectPopover";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";

import type { PanelWithTasks } from "server/api/routers/board";

interface TaskCreationModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  panelItem: PanelWithTasks;
  bid: string;
}
const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  open,
  setOpen,
  panelItem,
  bid,
}) => {
  const { data: sessionData } = useSession();
  const cancelButtonRef = useRef(null);

  // State for the current user in the user modal
  const [currUser, setCurrUser] = useState<User | null>(null);

  // State for the new task form
  const [newTaskForm, setNewTaskForm] = useState<{
    task_title: string;
    task_description: JSONContent;
    task_start_dt: string;
    task_end_dt: string;
    task_due_dt: string;
    task_assignedUsers: User[];
  }>({
    task_title: "",
    task_description: {},
    task_start_dt: "",
    task_end_dt: "",
    task_due_dt: "",
    task_assignedUsers: [],
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // ... Configure the StarterKit as you wish
        // paragraph: {
        //   HTMLAttributes: {
        //     class: "my-4",
        //   },
        // },
        orderedList: {
          HTMLAttributes: {
            class: "my-2",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "my-2",
          },
        },
      }),
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "Add a title...";
          }
          return "Write something...";
        },
      }),
      Typography,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none p-2 border border-gray-300 rounded-md focus:bg-gray-50 bg-white focus:outline-indigo-600",
      },
    },
    onUpdate: ({ editor }) =>
      setNewTaskForm((prev) => ({
        ...prev,
        task_description: editor.getJSON(),
      })),
  });

  // Mutation to create a new task
  const { mutate: createTask } = useCreateTask();

  // State for whether the user modal is open
  const [openUserModal, setOpenUserModal] = useState(false);

  // Callback to handle changes made to the task creation form
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  // Callback to handle submission of the task creation form
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
    createTask({
      boardId: panelItem.board_id,
      panelId: panelItem.id,
      taskId: newTaskId,
      postTaskOrder: postTaskOrder,
      title: task_title,
      description: JSON.stringify(task_description),
      startDate: task_start_dt.length > 0 ? new Date(task_start_dt) : null,
      endDate: task_end_dt.length > 0 ? new Date(task_end_dt) : null,
      dueDate: task_due_dt.length > 0 ? new Date(task_due_dt) : null,
      taskAssignees: newTaskForm.task_assignedUsers.map((user) => user.id),
      creatorId: sessionData?.user.id ?? "",
    });

    setOpen(false);

    //reset newEntry form
    setNewTaskForm({
      task_title: "",
      task_description: {},
      task_start_dt: "",
      task_end_dt: "",
      task_due_dt: "",
      task_assignedUsers: [],
    });

    //reset editor
    editor?.chain().focus().clearContent().run();

    console.log(newTaskForm);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg border-2 border-gray-400 bg-white text-left shadow-solid-md shadow-slate-800/50 transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
                          <EditorContent editor={editor} spellCheck={false} />
                          {/* <textarea
                            name="task_description"
                            id="task_description"
                            rows={3}
                            className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                            placeholder="Write a few sentences about the task."
                            value={newTaskForm.task_description}
                            onChange={handleFormChange}
                          /> */}
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
                            {newTaskForm.task_assignedUsers.map((user) => (
                              <div
                                key={user.id}
                                className="relative flex items-center justify-center"
                              >
                                {/* User avatar */}
                                <Tooltip
                                  key={user.name}
                                  title={user.name ?? ""}
                                  className="relative"
                                  onClick={() => {
                                    setCurrUser(user);
                                    setOpenUserModal(true);
                                  }}
                                >
                                  <div className="h=[26px] relative inline-block w-[26px] sm:h-8 sm:w-8">
                                    <img
                                      // prevent images from being compressed
                                      className="cursor-pointer rounded-full hover:opacity-75"
                                      src={
                                        user.image ??
                                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                                      }
                                      alt={user.name ?? ""}
                                    />
                                  </div>
                                </Tooltip>

                                {/* Remove user button */}
                                {/* Remove button */}
                                <button
                                  type="button"
                                  className="absolute -bottom-4 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:h-6 sm:w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewTaskForm((prev) => ({
                                      ...prev,
                                      task_assignedUsers:
                                        prev.task_assignedUsers.filter(
                                          (u) => u.id !== user.id
                                        ),
                                    }));
                                  }}
                                >
                                  <span className="sr-only">
                                    Remove {user.name}
                                  </span>
                                  <XMarkIcon
                                    className="h-3 w-3 sm:h-4 sm:w-4"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            ))}

                            {/* Only shown when collaborator avatar is clicked */}
                            <UserModal
                              open={openUserModal}
                              setOpen={setOpenUserModal}
                              user={currUser}
                            />
                            <AssigneeSelectPopover
                              bid={bid}
                              newTaskForm={newTaskForm}
                              setNewTaskForm={setNewTaskForm}
                              innerClassName="fixed bottom-40 left-8"
                            />
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
                            task_description: {},
                            task_start_dt: "",
                            task_end_dt: "",
                            task_due_dt: "",
                            task_assignedUsers: [],
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
