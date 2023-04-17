//Done by Jansonn Lim 2102990
import { NextApiRequest, NextApiResponse } from "next";
import { info } from "../../server/info/tnc.json";

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(400).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json({ message: info });
  } catch (err) {
    console.log("error is: ", err);
  }
};
