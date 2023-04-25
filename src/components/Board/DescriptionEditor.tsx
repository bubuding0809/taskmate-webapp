import { useSession } from "next-auth/react";
import { classNames, formatDate } from "@/utils/helper";
import { env } from "env.mjs";
import { Divider, ListItem } from "@mui/material";
import { RouterOutputs, api } from "@/utils/api";
import React, { useEffect, useState } from "react";
import useDebouceQuery from "@/utils/hooks/useDebounceQuery";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Collaboration from "@tiptap/extension-collaboration";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";

import type { Optional } from "@/utils/types";

type ExtractPanel<T> = T extends { Panel: infer U } ? U : never;
type Panel = ExtractPanel<RouterOutputs["board"]["getBoardById"]>[number];
type Task = Optional<Panel["Task"][number], "subtasks">;

const caretColors = [
  "#958DF1",
  "#F98181",
  "#F59E0B",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
  "#F9A8D4",
];
interface DescriptionEditorProps {
  task: Task;
  panel: Panel;
  innerClassName?: string;
}

const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
  task,
  panel,
  innerClassName = "",
}) => {
  const { data: sessionData } = useSession();

  // State to hold the live and debounced task description state
  const [_, setLiveDescription, debouncedDescription] = useDebouceQuery(
    "",
    500
  );

  // TODO - temporary refetch of board data, to be moved to custom hook
  const { refetch: refetchBoardData, isRefetching } =
    api.board.getBoardById.useQuery({
      boardId: panel.board_id,
    });

  // State to hold the hocuspocus provider, setProvider is not used
  const [hocusProvider] = useState(() => {
    return new HocuspocusProvider({
      url: env.NEXT_PUBLIC_HOCUSPOCUS_URL,
      name: `task.${task.id}`,
      token: sessionData?.user.id,
    });
  });

  // Rich text editor for the task description
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // ... Configure the StarterKit as you wish
        paragraph: {
          HTMLAttributes: {
            class: "my-4",
          },
        },
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
        history: false,
      }),
      Collaboration.configure({
        document: hocusProvider.document,
      }),
      CollaborationCursor.configure({
        provider: hocusProvider,
        user: {
          name: sessionData?.user.name,
          color: caretColors[Math.floor(Math.random() * caretColors.length)],
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
          "prose max-w-none p-4 focus:outline-none border-2 border-gray-800 rounded-lg rounded-tl-none focus:bg-gray-50 focus:border-indigo-700 bg-white shadow focus:shadow-solid-medium",
      },
    },
    onUpdate: ({ editor }) => setLiveDescription(editor.getText()),
  });

  // Effect to update the task description when the debounced description changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      void refetchBoardData();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [debouncedDescription]);

  return (
    <div className={classNames(innerClassName, "group")}>
      <hgroup className="flex w-max items-center space-x-2">
        <h2 className="rounded-lg rounded-b-none border-2 border-b-0 border-gray-800 bg-gray-800 py-1 px-2 text-lg font-medium text-white group-focus-within:border-indigo-700 group-focus-within:bg-indigo-700">
          Description
        </h2>
        <span className="text-sm text-gray-500">
          {/* Show editor status */}
          {(() => {
            if (hocusProvider.status === "connected") {
              return isRefetching
                ? "Saving..."
                : `Last edited ${formatDate(task.updated_at)}`;
            } else {
              return "Connecting to editor...";
            }
          })()}
        </span>
      </hgroup>
      {/* Show skeleton loader before provider is connected */}
      {hocusProvider.status === "connected" ? (
        <EditorContent editor={editor} spellCheck={false} />
      ) : (
        <EditorSkeleton />
      )}
    </div>
  );
};

const EditorSkeleton: React.FC = () => {
  return (
    <div className="rounded-md rounded-tl-none border-2 border-gray-800 bg-gray-100 p-4">
      <div className="animate-pulse">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-2/4 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-3/5 rounded bg-gray-200" />
        <div className="mt-2 h-4 rounded bg-gray-200" />
        <div className="mt-2 h-4 rounded bg-gray-200" />
        <div className="mt-2 h-4 rounded bg-gray-200" />
        <div className="mt-2 h-4 rounded bg-gray-200" />
      </div>
    </div>
  );
};
export default DescriptionEditor;
