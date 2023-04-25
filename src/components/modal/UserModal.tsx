/* DONE BY: Ding RuoQian 2100971 */

import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { EnvelopeIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import type { User } from "@prisma/client";
import { nanoid } from "nanoid";

interface UserModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: User | null;
  actions?: {
    callback: () => Promise<boolean>;
    loading: boolean;
    name: string;
    icon: React.ForwardRefExoticComponent<
      React.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
        titleId?: string | undefined;
      }
    >;
  }[];
}

const placeholderUser = {
  id: nanoid(),
  name: "Jane Cooper",
  title: "Paradigm Representative",
  statusMessage: "I am a placeholder for a user's status message.",
  role: "Admin",
  email: "janecooper@example.com",
  telephone: "+1-202-555-0170",
  imageUrl:
    "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

const UserModal: React.FC<UserModalProps> = ({
  open,
  setOpen,
  user,
  actions,
}) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={(val) => {
          // Prevent closing modal when actions are being processed
          if (actions !== undefined && actions[0]?.loading) return;
          setOpen(val);
        }}
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
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
              <Dialog.Panel className="relative flex transform flex-col divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
                <div className="flex flex-1 flex-col p-8">
                  <img
                    className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
                    src={user?.image ?? placeholderUser.imageUrl}
                    alt=""
                  />
                  <h3 className="mt-6 text-sm font-medium text-gray-900">
                    {user?.name ?? placeholderUser.name}
                  </h3>
                  <dl className="mt-1 flex flex-grow flex-col justify-between">
                    <dt className="sr-only">Title</dt>
                    <dd className="text-sm text-gray-500">
                      {user?.status_message ?? placeholderUser.statusMessage}
                    </dd>
                    <dt className="sr-only">Role</dt>
                    <dd className="mt-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        {user?.email ?? placeholderUser.email}
                      </span>
                    </dd>
                  </dl>
                </div>
                <div className="-mt-px flex divide-x divide-gray-200">
                  {/* Email action */}
                  <div className="flex w-0 flex-1">
                    <a
                      href={`mailto:${user?.email ?? "bubuding0809@gmail.com"}`}
                      className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <EnvelopeIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      Email
                    </a>
                  </div>

                  {/* Visit profile action */}
                  <div className="-ml-px flex w-0 flex-1">
                    <a
                      href={`/profile/${user?.id ?? placeholderUser.id}`}
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <UserCircleIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      Profile
                    </a>
                  </div>
                </div>

                {/* User action list */}
                <div className="-mt-px flex flex-col divide-y divide-gray-200">
                  {actions?.map((action, index) => (
                    <div key={index} className="flex flex-1">
                      <button
                        disabled={action.loading}
                        className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900  disabled:bg-indigo-300 disabled:text-white"
                        onClick={() => {
                          action
                            .callback()
                            .then((isClose) => isClose && setOpen(false))
                            .catch((err) => console.error(err));
                        }}
                      >
                        {action.loading ? (
                          <>
                            <svg
                              aria-hidden="true"
                              role="status"
                              className="inline h-4 w-4 animate-spin"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="#1C64F2"
                              />
                            </svg>
                            Removing ...
                          </>
                        ) : (
                          <>
                            <action.icon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            {action.name}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default UserModal;
