import { classNames } from "@/utils/helper";
import { HomeIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import FlyOutFolderMenu from "./FlyOutFolderMenu";

export type BreadCrumbPage = {
  name: string;
  href: string;
  current: boolean;
  isFolder: boolean;
  icon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
      titleId?: string | undefined;
    }
  >;
};
interface BreadCrumbsProps {
  pages: BreadCrumbPage[];
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ pages }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol
        role="list"
        className="flex space-x-4 rounded-md bg-white px-6 shadow"
      >
        <li className="flex">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-500"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name} className="flex">
            <div className="flex items-center">
              <svg
                className="h-full w-6 flex-shrink-0 text-gray-200"
                viewBox="0 0 24 44"
                preserveAspectRatio="none"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              <Link
                href={page.href}
                className={classNames(
                  page.current ? "text-gray-500" : "text-gray-400",
                  "ml-4 flex text-sm font-medium hover:text-gray-700"
                )}
                aria-current={page.current ? "page" : undefined}
                onClick={(e) => {
                  if (page.isFolder) {
                    e.preventDefault();
                    alert("TODO - Open flyout menu");
                  }
                }}
              >
                {page.icon && <page.icon className="mr-1 h-5 w-5" />}
                <span>{page.name}</span>
              </Link>
            </div>
          </li>
        ))}
      </ol>
      {/* TODO - Set folder crumb to open flyout menu when clicked */}
      {/* <FlyOutFolderMenu /> */}
    </nav>
  );
};

export default BreadCrumbs;
