// Styles for the welcome message, terms gate and starter prompts.
// Kept separate from the big Tailwind string in chatWidget/index.tsx.
export const onboardingStyles = `
.cl-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.cl-reset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: rgb(107 114 128);
  transition: background-color 150ms, color 150ms;
}

.cl-reset-button svg {
  width: 1.125rem;
  height: 1.125rem;
}

.cl-reset-button:hover:not(:disabled) {
  background-color: rgb(243 244 246);
  color: rgb(17 24 39);
}

.cl-reset-button:disabled {
  opacity: 0.35;
}

.cl-chat-message {
  gap: 0.5rem;
  align-items: flex-start;
}

.cl-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  overflow: hidden;
  object-fit: cover;
  line-height: 1;
  font-weight: 500;
  background-color: rgb(229 231 235);
  color: rgb(55 65 81);
  user-select: none;
}

.cl-avatar-spacer {
  flex-shrink: 0;
}

.cl-starters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
}

.cl-starter {
  border: 1px solid rgb(59 130 246);
  border-radius: 9999px;
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(37 99 235);
  background-color: rgb(255 255 255);
  text-align: left;
  transition: background-color 150ms, color 150ms;
}

.cl-starter:hover:not(:disabled) {
  background-color: rgb(59 130 246);
  color: rgb(255 255 255);
}

.cl-starter:disabled {
  opacity: 0.5;
}

.cl-terms {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgb(229 231 235);
  background-color: rgb(255 255 255);
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(55 65 81);
  flex-shrink: 0;
  max-height: 60%;
  overflow-y: auto;
}

.cl-terms .markdown-body {
  font-size: 0.875rem;
  background: transparent;
  color: inherit;
}

.cl-terms-check {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.cl-terms-check input {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.cl-terms-button {
  align-self: flex-end;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background-color: rgb(59 130 246);
  color: rgb(255 255 255);
}

.cl-terms-button:hover:not(:disabled) {
  background-color: rgb(29 78 216);
}

.cl-terms-button:disabled {
  opacity: 0.5;
}
`;
