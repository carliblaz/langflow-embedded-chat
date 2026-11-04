export type AvatarProps = {
    bot_avatar?: string;
    user_avatar?: string;
    avatar_size?: number;
    avatar_style?: React.CSSProperties;
  };

export type ChatMessageType = AvatarProps & {
    message: string;
    isSend: boolean;
    error?: boolean;
    bot_message_style?: React.CSSProperties;
    user_message_style?: React.CSSProperties;
    error_message_style?: React.CSSProperties;
    show_avatar?: boolean;
    isWelcome?: boolean;
  };


  export type ChatMessagePlaceholderType = {
    bot_message_style?: React.CSSProperties;
    bot_avatar?: string;
    avatar_size?: number;
    avatar_style?: React.CSSProperties;
    show_avatar?: boolean;
  };
