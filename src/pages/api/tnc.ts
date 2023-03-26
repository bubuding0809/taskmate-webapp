// ✅ using the async module asynchronously
import { promises as fsPromises } from "fs";
import * as path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { tnc } from "../../server/info/tnc.json";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(400).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json({ message: tnc });
  } catch (err) {
    console.log("error is: ", err);
  }
};
