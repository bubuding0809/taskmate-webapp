/* DONE BY: Ding RuoQian 2100971 */

import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env.mjs";
import Pusher from "pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "server/auth";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    socket_id: socketId,
    userId,
    channel_name: channelId,
  } = req.body as {
    socket_id: string;
    userId: string;
    channel_name: string;
  };
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (session.user.id !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const presenceData = {
    user_id: session.user.id,
    user_info: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
  };

  const authResponse = pusher.authorizeChannel(
    socketId,
    channelId,
    presenceData
  );

  res.send(authResponse);
};
