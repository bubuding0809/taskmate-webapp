/**
 * @param bid - The board id
 * @param sender - The sender of the update
 * @returns void
 **/
export const handlePusherUpdate = ({
  bid,
  sender,
}: {
  bid: string;
  sender: string;
}) => {
  // Make real-time updates to other users when a task is moved
  void fetch("/api/pusher", {
    method: "POST",
    body: JSON.stringify({
      channel: "public-board-" + bid,
      event: "update-event",
      data: {
        timeStamp: Date.now(),
        sender: sender,
      },
    }),
  });
};
