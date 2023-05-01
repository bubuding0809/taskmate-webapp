// Type definitions for the client-side application

import { User } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

export type EmojiType = {
  aliases: string[];
  emoticons: string[];
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
};

export type NewTaskFormType = {
  task_title: string;
  task_description: JSONContent | null;
  task_start_dt: string;
  task_end_dt: string;
  task_due_dt: string;
  task_assignedUsers: User[];
};

// Optional utility type
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
