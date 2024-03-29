/* DONE BY: Ding RuoQian 2100971 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { classNames } from "../helper";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export type Toast = {
  title: string;
  description?: string;
  icon: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
      titleId?: string | undefined;
    }
  >;
  position?: "start" | "center" | "end";
};

const ToastContext = createContext(
  undefined as ((toast: Toast) => void) | undefined
);

export default ToastContext;

interface ToastContextProviderProps {
  children: React.ReactNode;
  duration?: number;
}

export const ToastContextProvider: React.FC<ToastContextProviderProps> = ({
  children,
  duration = 3000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastParent] = useAutoAnimate();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (toasts.length > 0) {
      timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, duration);
    }

    return () => timer && clearTimeout(timer);
  }, [toasts]);

  const addToast = useCallback(
    (newToast: Toast) => {
      setToasts((prev) => [...prev, newToast]);
    },
    [setToasts]
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}

      {/* TODO - extract toast container to it's own component */}
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end gap-2 px-4 py-6 sm:items-start sm:py-20 sm:px-4"
      >
        <div
          ref={toastParent}
          className="z-50 flex w-full flex-col items-center space-y-4 sm:items-end"
        >
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          {toasts.map((toast, index) => {
            const toastPosition =
              (toast.position && `self-${toast.position}`) ?? "";
            return (
              <div
                key={index}
                className={classNames(
                  toastPosition,
                  "pointer-events-auto z-50 w-full max-w-sm rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5"
                )}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <toast.icon
                      className="h-6 w-6 text-green-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {toast.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {toast.description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        // remove toast from state by index
                        setToasts((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error(
      "useToastContext must be used within a ToastContextProvider"
    );
  }

  return context;
};
