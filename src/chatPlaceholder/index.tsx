import { MoreHorizontal } from "lucide-react";
import { ChatMessagePlaceholderType } from "../types/chatWidget";
import Avatar, { AvatarSpacer } from "../chatWidget/avatar";

export default function ChatMessagePlaceholder({
  bot_message_style,
  bot_avatar,
  avatar_size = 32,
  avatar_style,
  show_avatar = true,
}: ChatMessagePlaceholderType) {
  return (
    <div
      className="cl-chat-message cl-justify-start"
    >
        {bot_avatar && (show_avatar
          ? <Avatar value={bot_avatar} size={avatar_size} style={avatar_style} alt="Assistant" />
          : <AvatarSpacer size={avatar_size} />)}
        <div style={bot_message_style} className={"cl-bot_message"}>
            <div className="cl-animate-pulse">
              <MoreHorizontal />
            </div>
        </div>
    </div>
  );
}
