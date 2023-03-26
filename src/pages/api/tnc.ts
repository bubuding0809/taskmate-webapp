// ✅ using the async module asynchronously
import { promises as fsPromises } from "fs";
import * as path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(400).json({ message: "Method not allowed" });
  }

  try {
    const fileContents = await fsPromises.readFile(
      path.join("src/server/info", "tnc.txt"),
      {
        encoding: "utf8",
      }
    );
    res.status(200).json({ message: fileContents });
  } catch (err) {
    console.log("error is: ", err);
  }
};
