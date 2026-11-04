import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TermsGate({
  terms_message,
  terms_checkbox_label,
  terms_accept_label,
  terms_style,
  onAccept,
}: {
  terms_message: string;
  terms_checkbox_label?: string;
  terms_accept_label?: string;
  terms_style?: React.CSSProperties;
  onAccept: () => void;
}) {
  const [checked, setChecked] = useState(false);
  // With a checkbox label the visitor must tick it first; without one the button alone is enough.
  const needsCheckbox = !!terms_checkbox_label;

  return (
    <div className="cl-terms" style={terms_style}>
      <Markdown
        className="markdown-body"
        remarkPlugins={[remarkGfm]}
        components={{
          // Open links (e.g. to the full terms) in a new tab so the chat isn't lost.
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {terms_message}
      </Markdown>
      {needsCheckbox && (
        <label className="cl-terms-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>{terms_checkbox_label}</span>
        </label>
      )}
      <button
        className="cl-terms-button"
        disabled={needsCheckbox && !checked}
        onClick={onAccept}
      >
        {terms_accept_label || "Accept and start chatting"}
      </button>
    </div>
  );
}
