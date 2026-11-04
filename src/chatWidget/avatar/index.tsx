import { useState } from "react";

// A value is treated as an image when it looks like a URL or an image file;
// anything else (an emoji, initials like "AI") is rendered as text.
export function isImageAvatar(value: string) {
  return (
    /^(https?:\/\/|data:image\/|\/|\.\.?\/)/i.test(value) ||
    /\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(value)
  );
}

export default function Avatar({
  value,
  size = 32,
  style,
  alt,
}: {
  value?: string;
  size?: number;
  style?: React.CSSProperties;
  alt: string;
}) {
  const [broken, setBroken] = useState(false);
  if (!value) return null;

  const base: React.CSSProperties = { width: size, height: size, fontSize: size * 0.5, ...style };

  if (isImageAvatar(value) && !broken) {
    return (
      <img
        className="cl-avatar"
        src={value}
        alt={alt}
        style={base}
        onError={() => setBroken(true)}
      />
    );
  }
  // Text avatar; a broken image falls back to the first letter of the alt text.
  const text = broken ? alt.charAt(0).toUpperCase() : value;
  return (
    <div className="cl-avatar" style={base} aria-label={alt} role="img">
      {text}
    </div>
  );
}

// Keeps bubbles aligned when an avatar is hidden for consecutive messages.
export function AvatarSpacer({ size = 32 }: { size?: number }) {
  return <div className="cl-avatar-spacer" style={{ width: size }} />;
}
