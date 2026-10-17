import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (text: string, author: string) => void;
  isPending: boolean;
}

const DEFAULT_AUTHORS = ['You', 'Dev Dave', 'Architect Alice', 'QA Quinn'];

const QUICK_PROMPTS = [
  '⚡ React 19 Actions simplify optimistic flows dramatically.',
  '⚠️ Test high latency and rollback behavior!',
  '🚀 Notice how the comment is visible before the server responds.',
];

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isPending }) => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('You');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    onSubmit(trimmedText, author.trim() || 'You');
    setText('');
    setCharCount(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setText(prompt);
    setCharCount(prompt.length);
  };

  return (
    <form className="comment-form-card" onSubmit={handleSubmit}>
      <div className="form-header-row">
        <div className="form-author-group">
          <label htmlFor="comment-author" className="field-label">
            Posting as:
          </label>
          <div className="author-select-wrapper">
            <input
              id="comment-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input-author"
              placeholder="Your Name"
              maxLength={24}
              required
            />
            <div className="author-pills">
              {DEFAULT_AUTHORS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`pill-author ${author === name ? 'selected' : ''}`}
                  onClick={() => setAuthor(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="form-textarea-group">
        <textarea
          id="comment-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setCharCount(e.target.value.length);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Share your thoughts... (Ctrl+Enter to post instantly)"
          className="comment-textarea"
          rows={3}
          maxLength={300}
          required
        />
        <div className="textarea-footer">
          <span className="character-counter">
            {charCount}/300 characters
          </span>
          <span className="shortcut-hint">
            Tip: Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
          </span>
        </div>
      </div>

      <div className="form-actions-bar">
        <div className="quick-prompts-container">
          <span className="quick-prompts-label">Quick test:</span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-quick-prompt"
              onClick={() => handleQuickPrompt(prompt)}
            >
              {idx === 0 ? '✨ React 19' : idx === 1 ? '⚠️ High Latency' : '⚡ Instant Feed'}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="btn-submit-comment"
          disabled={!text.trim()}
        >
          {isPending ? (
            <>
              <span className="spinner-mini" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Post Comment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
