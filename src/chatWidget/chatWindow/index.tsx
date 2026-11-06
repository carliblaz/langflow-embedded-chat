import { RotateCcw, Send } from "lucide-react";
import { extractMessageFromOutput, getAnimationOrigin, getChatPosition, parseAdditionalHeaders } from "../utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessageType } from "../../types/chatWidget";
import ChatMessage from "./chatMessage";
import { sendMessage } from "../../controllers";
import ChatMessagePlaceholder from "../../chatPlaceholder";
import TermsGate from "./termsGate";

export default function ChatWindow({
  api_key,
  flowId,
  hostUrl,
  updateLastMessage,
  messages,
  output_type,
  input_type,
  output_component,
  bot_message_style,
  send_icon_style,
  user_message_style,
  chat_window_style,
  error_message_style,
  placeholder_sending,
  send_button_style,
  online = true,
  open,
  online_message = "We'll reply as soon as we can",
  offline_message = "We're offline now",
  window_title = "Chat",
  placeholder,
  input_style,
  input_container_style,
  addMessage,
  position,
  triggerRef,
  width = 450,
  height = 650,
  tweaks,
  sessionId,
  additional_headers,
  welcome_message,
  starter_prompts = [],
  starter_prompt_style,
  terms_required = false,
  terms_accepted = true,
  terms_message,
  terms_checkbox_label,
  terms_accept_label,
  terms_style,
  onAcceptTerms,
  bot_avatar,
  user_avatar,
  avatar_size = 32,
  avatar_style,
  resetCount = 0,
  onReset,
  show_reset_button = false,
  reset_button_title = "Start a new chat",
  reset_button_style,
  show_subtitle = true,
  welcome_message_style,
}: {
  api_key?: string;
  output_type: string,
  input_type: string,
  output_component?: string,
  bot_message_style?: React.CSSProperties;
  send_icon_style?: React.CSSProperties;
  user_message_style?: React.CSSProperties;
  chat_window_style?: React.CSSProperties;
  error_message_style?: React.CSSProperties;
  send_button_style?: React.CSSProperties;
  online?: boolean;
  open: boolean;
  online_message?: string;
  placeholder_sending?: string;
  offline_message?: string;
  window_title?: string;
  placeholder?: string;
  input_style?: React.CSSProperties;
  input_container_style?: React.CSSProperties;
  tweaks?: { [key: string]: any };
  flowId: string;
  hostUrl: string;
  updateLastMessage: Function;
  messages: ChatMessageType[];
  addMessage: Function;
  position?: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
  width?: number;
  height?: number;
  sessionId: React.MutableRefObject<string>;
  additional_headers?: { [key: string]: string } | string;
  welcome_message?: string;
  starter_prompts?: string[];
  starter_prompt_style?: React.CSSProperties;
  terms_required?: boolean;
  terms_accepted?: boolean;
  terms_message?: string;
  terms_checkbox_label?: string;
  terms_accept_label?: string;
  terms_style?: React.CSSProperties;
  onAcceptTerms?: () => void;
  bot_avatar?: string;
  user_avatar?: string;
  avatar_size?: number;
  avatar_style?: React.CSSProperties;
  resetCount?: number;
  onReset?: () => void;
  show_reset_button?: boolean;
  reset_button_title?: string;
  reset_button_style?: React.CSSProperties;
  show_subtitle?: boolean;
  welcome_message_style?: React.CSSProperties;
}) {
  const [value, setValue] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);
  const lastMessage = useRef<HTMLDivElement>(null);
  const [windowPosition, setWindowPosition] = useState({ left: "0", top: "0" });
  const inputRef = useRef<HTMLInputElement>(null); /* User input Ref */
  useEffect(() => {
    if (triggerRef)
      setWindowPosition(
        getChatPosition(
          triggerRef.current!.getBoundingClientRect(),
          width,
          height,
          position
        )
      );
  }, [triggerRef, width, height, position]);

  /* Initial listener for loss of focus that refocuses User input after a small delay */

  const [sendingMessage, setSendingMessage] = useState(false);

  // Ensure additional_headers is always an object
  const parsedHeaders = useMemo(() => parseAdditionalHeaders(additional_headers), [additional_headers]);

  // The chat is locked until the visitor has accepted the terms (when terms are required).
  const locked = terms_required && !terms_accepted;
  // Starter prompts disappear once the visitor has sent anything.
  const hasUserMessage = messages.some((m) => m.isSend);
  const showStarters = !locked && !hasUserMessage && starter_prompts.length > 0;

  // Every reset bumps resetCount. Replies to requests sent before the reset are
  // ignored, so an answer to the old conversation can't land in the new one.
  const resetGeneration = useRef(resetCount);
  useEffect(() => {
    resetGeneration.current = resetCount;
    setValue("");
    setSendingMessage(false);
  }, [resetCount]);

  const avatarProps = { bot_avatar, user_avatar, avatar_size, avatar_style };
  // Show the avatar only on the first message of a run from the same sender.
  function showAvatarAt(index: number) {
    if (index === 0) return !(welcome_message && !messages[0].isSend);
    return messages[index - 1].isSend !== messages[index].isSend;
  }
  const lastIsBot = messages.length > 0
    ? !messages[messages.length - 1].isSend
    : !!welcome_message;

  function handleClick() {
    submitMessage(value);
  }

  function submitMessage(text: string) {
    if (locked || sendingMessage) return;
    if (text && text.trim() !== "") {
      addMessage({ message: text, isSend: true });
      setSendingMessage(true);
      setValue("");
      const generation = resetGeneration.current;
      sendMessage(hostUrl, flowId, text, input_type, output_type, sessionId, output_component, tweaks, api_key, parsedHeaders)
        .then((res) => {
          if (resetGeneration.current !== generation) return;
          if (
            res.data &&
            res.data.outputs &&
            Object.keys(res.data.outputs).length > 0 &&
            res.data.outputs[0].outputs && res.data.outputs[0].outputs.length > 0
          ) {
            const flowOutputs: Array<any> = res.data.outputs[0].outputs;
            if (output_component &&
              flowOutputs.map(e => e.component_id).includes(output_component)) {
              Object.values(flowOutputs.find(e => e.component_id === output_component).outputs).forEach((output: any) => {
                addMessage({
                  message: extractMessageFromOutput(output),
                  isSend: false,
                });
              })
            } else if (
              flowOutputs.length === 1
            ) {
              Object.values(flowOutputs[0].outputs).forEach((output: any) => {
                addMessage({
                  message: extractMessageFromOutput(output),
                  isSend: false,
                });
              })
            } else {
              flowOutputs
                .sort((a, b) => {
                  // Get the earliest timestamp from each flowOutput's outputs
                  const aTimestamp = Math.min(...Object.values(a.outputs).map((output: any) => Date.parse(output.message?.timestamp)));
                  const bTimestamp = Math.min(...Object.values(b.outputs).map((output: any) => Date.parse(output.message?.timestamp)));
                  return aTimestamp - bTimestamp; // Sort descending (newest first)
                })
                .forEach((flowOutput) => {
                  Object.values(flowOutput.outputs).forEach((output: any) => {
                    addMessage({
                      message: extractMessageFromOutput(output),
                      isSend: false,
                    });
                  });
                });
            }
          }
          if (res.data && res.data.session_id) {
            sessionId.current = res.data.session_id;
          }
          setSendingMessage(false);
        })
        .catch((err) => {
          if (resetGeneration.current !== generation) return;
          const response = err.response;
          let errorText = "Something went wrong. Please try again.";
          if (err.code === "ERR_NETWORK") {
            errorText = "Network error";
          } else if (response && response.data && typeof response.data.detail === "string") {
            errorText = response.data.detail;
          } else if (response && response.status) {
            errorText = `Request failed (${response.status})`;
          }
          // Append the error instead of replacing the visitor's own message.
          addMessage({ message: errorText, isSend: false, error: true });
          console.error(err);
          setSendingMessage(false);
        });
    }
  }

  useEffect(() => {
    if (lastMessage.current)
      lastMessage.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Refocus the User input whenever a new response is returned from the LLM */

  useEffect(() => {
    // after a slight delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [messages, open]);

  return (
    <div
      className={
        "cl-chat-window " +
        getAnimationOrigin(position) +
        (open ? " cl-scale-100" : " cl-scale-0")
      }
      style={{ ...windowPosition, zIndex: 9999 }}
    >
      <div
        style={{ ...chat_window_style, width: width, height: height }}
        ref={ref}
        className="cl-window"
      >
        <div className="cl-header">
          <div className="cl-header-row">
            <span>{window_title}</span>
            {show_reset_button && (
              <button
                className="cl-reset-button"
                style={reset_button_style}
                title={reset_button_title}
                aria-label={reset_button_title}
                disabled={!hasUserMessage}
                onClick={() => onReset && onReset()}
              >
                <RotateCcw />
              </button>
            )}
          </div>
          {show_subtitle && (
          <div className="cl-header-subtitle">
            {online ? (
              <>
                <div className="cl-online-message"></div>
                {online_message}
              </>
            ) : (
              <>
                <div className="cl-offline-message"></div>
                {offline_message}
              </>
            )}
          </div>
          )}
        </div>
        <div className="cl-messages_container">
          {welcome_message && (
            <ChatMessage
              {...avatarProps}
              className="cl-welcome_message"
              bot_message_style={{ ...bot_message_style, ...welcome_message_style }}
              message={welcome_message}
              isSend={false}
              isWelcome={true}
            />
          )}
          {messages.map((message, index) => (
            <ChatMessage
              {...avatarProps}
              show_avatar={showAvatarAt(index)}
              bot_message_style={bot_message_style}
              user_message_style={user_message_style}
              error_message_style={error_message_style}
              key={index}
              message={message.message}
              isSend={message.isSend}
              error={message.error}
            />
          ))}
          {showStarters && (
            <div
              className="cl-starters"
              style={bot_avatar ? { paddingLeft: `calc(${avatar_size}px + 1rem)` } : undefined}
            >
              {starter_prompts.map((prompt) => (
                <button
                  key={prompt}
                  className="cl-starter"
                  style={starter_prompt_style}
                  disabled={sendingMessage}
                  onClick={() => submitMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {sendingMessage && (
            <ChatMessagePlaceholder
              bot_message_style={bot_message_style}
              bot_avatar={bot_avatar}
              avatar_size={avatar_size}
              avatar_style={avatar_style}
              show_avatar={!lastIsBot}
            />
          )}
          <div ref={lastMessage}></div>
        </div>
        {locked ? (
          <TermsGate
            terms_message={terms_message || "Please accept the terms of use before starting the chat."}
            terms_checkbox_label={terms_checkbox_label}
            terms_accept_label={terms_accept_label}
            terms_style={terms_style}
            onAccept={() => onAcceptTerms && onAcceptTerms()}
          />
        ) : (
        <div style={input_container_style} className="cl-input_container">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleClick();
            }}
            type="text"
            disabled={sendingMessage}
            placeholder={sendingMessage ? (placeholder_sending || "Thinking...") : (placeholder || "Type your message...")}
            style={input_style}
            ref={inputRef}
            className="cl-input-element"
          />
          <button
            style={send_button_style}
            disabled={sendingMessage}
            onClick={handleClick}
          >
            <Send
              style={send_icon_style}
              className={
                "cl-send-icon " +
                (!sendingMessage
                  ? "cl-notsending-message"
                  : "cl-sending-message")
              }
            />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
