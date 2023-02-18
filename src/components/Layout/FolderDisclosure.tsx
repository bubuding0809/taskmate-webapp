import { Disclosure } from "@headlessui/react";
import { useRef, useEffect } from "react";
import autoAnimate from "@formkit/auto-animate";
import { classNames } from "../../utils/helper";
import Link from "next/link";

interface FolderDisclosureProps {
  item: {
    name: string;
    icon: string | JSX.Element;
    children: {
      name: string;
      href: string;
      icon: string | JSX.Element;
    }[];
  };
  sidebarExpanded: boolean;
}
const FolderDisclosure: React.FC<FolderDisclosureProps> = ({
  item,
  sidebarExpanded,
}) => {
  // Set up autoAnimation of list element
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <Disclosure as="div" key={item.name} className="space-y-1">
      {({ open }) => (
        <div ref={parent}>
          {/* Folder header */}
          <Disclosure.Button className="group flex w-full flex-col items-center rounded-md p-2 text-left text-sm font-medium text-gray-300  hover:bg-gray-700 hover:text-white focus:outline-none">
            <div className="flex w-full items-center justify-center">
              <span
                className={classNames(
                  sidebarExpanded ? "mr-3" : "mr-0",
                  "text-xl"
                )}
              >
                {item.icon}
              </span>
              {sidebarExpanded && (
                <>
                  <p className="flex-1 truncate">{item.name}</p>
                  <svg
                    className={classNames(
                      open ? "rotate-90 text-gray-400" : "text-gray-300",
                      "ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400"
                    )}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                  </svg>
                </>
              )}
            </div>
          </Disclosure.Button>

          {/* Children projects */}
          {sidebarExpanded && (
            <Disclosure.Panel className="space-y-1">
              {item.children.map((subItem) => (
                <Link href={`/board/${subItem.name}`} key={subItem.name}>
                  <button className="group flex w-full items-center justify-start rounded-md py-2 pl-11 pr-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none">
                    <span
                      className={classNames(
                        sidebarExpanded ? "mr-3" : "mr-0",
                        "text-xl"
                      )}
                    >
                      {subItem.icon}
                    </span>
                    {sidebarExpanded && (
                      <p className="flex-1 truncate text-start">
                        {subItem.name}
                      </p>
                    )}
                  </button>
                </Link>
              ))}
              <a onClick={(e) => e.preventDefault()}></a>
            </Disclosure.Panel>
          )}
        </div>
      )}
    </Disclosure>
  );
};

export default FolderDisclosure;
