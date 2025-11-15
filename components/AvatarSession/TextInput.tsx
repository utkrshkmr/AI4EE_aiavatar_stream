import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import React, { useCallback } from "react";

import { Button } from "../Button";
import { useTextChat } from "../logic/useTextChat";

import agentMessages from "../../agent_messages.json";

export const TextInput: React.FC = () => {
  const { repeatMessage } = useTextChat();

  // Always use REPEAT mode
  const taskType = TaskType.REPEAT;
  const taskMode = TaskMode.ASYNC;

  const handleSendMessage = useCallback(
    (message: string) => {
      if (message.trim() === "") {
        return;
      }
      repeatMessage(message);
    },
    [repeatMessage],
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-center text-zinc-400 text-sm mb-2">
        Select a message to send to the avatar:
      </div>
      <div className="grid grid-cols-5 gap-2 w-full max-w-[600px] mx-auto">
        {agentMessages.map((message, index) => (
          <Button
            key={index}
            className="!bg-zinc-700 !text-white hover:!bg-zinc-600 !px-4 !py-2"
            onClick={() => handleSendMessage(message)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};
