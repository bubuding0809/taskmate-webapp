import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import type { User } from "@prisma/client";

interface UserModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: User;
}

const person = {
  name: "Jane Cooper",
  title: "Paradigm Representative",
  role: "Admin",
  email: "janecooper@example.com",
  telephone: "+1-202-555-0170",
  imageUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
};

const UserModal: React.FC<UserModalProps> = ({ open, setOpen, user }) => {
  return (
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
              <Dialog.Panel className="relative flex transform flex-col divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm ">
                <div className="flex flex-1 flex-col p-8">
                  <img
                    className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
                    src={user.image || person.imageUrl}
                    alt=""
                  />
                  <h3 className="mt-6 text-sm font-medium text-gray-900">
                    {user.name}
                  </h3>
                  <dl className="mt-1 flex flex-grow flex-col justify-between">
                    <dt className="sr-only">Title</dt>
                    <dd className="text-sm text-gray-500">
                      {user.status_message}
                    </dd>
                    <dt className="sr-only">Role</dt>
                    <dd className="mt-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        {user.email}
                      </span>
                    </dd>
                  </dl>
                </div>
                <div>
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="flex w-0 flex-1">
                      <a
                        href={`mailto:${
                          user.email ?? "bubuding0809@gmail.com"
                        }`}
                        className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                      >
                        <EnvelopeIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Email
                      </a>
                    </div>
                    <div className="-ml-px flex w-0 flex-1">
                      <a
                        href={`/profile/${user.id}`}
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
