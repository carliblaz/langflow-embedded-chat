import Markdown from "react-markdown";
import { ChatMessageType } from "../../../types/chatWidget";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";
import Avatar, { AvatarSpacer } from "../../avatar";

export default function ChatMessage({
  message,
  isSend,
  error,
  user_message_style,
  bot_message_style,
  error_message_style,
  bot_avatar,
  user_avatar,
  avatar_size = 32,
  avatar_style,
  show_avatar = true,
  isWelcome = false,
  className,
}: ChatMessageType) {
  const avatarValue = isSend ? user_avatar : bot_avatar;
  const avatar = avatarValue ? (
    show_avatar ? (
      <Avatar
        value={avatarValue}
        size={avatar_size}
        style={avatar_style}
        alt={isSend ? "You" : "Assistant"}
      />
    ) : (
      <AvatarSpacer size={avatar_size} />
    )
  ) : null;

  return (
    <div
      className={
        "cl-chat-message " + (isSend ? " cl-justify-end" : " cl-justify-start") +
        (isWelcome ? " welcome" : "") +
        (className ? " " + className : "")
      }
    >
      {!isSend && avatar}
      {isSend ? (
        <div style={user_message_style} className="cl-user_message">
          {message}
        </div>
      ) : error ? (
        <div style={error_message_style} className={"cl-error_message"}>
          {message}
        </div>
      ) : (
        <div style={bot_message_style} className={"cl-bot_message"}>
          <Markdown 
          className={"markdown-body prose flex flex-col word-break-break-word"}
          remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeMathjax]}
          >
            {message}
          </Markdown>
        </div>
      )}
      {isSend && avatar}
    </div>
  );
}
