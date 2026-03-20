import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './MessageInput.module.css';

export default function MessageInput({ onSend, onTypingStart, onTypingStop }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const btnRef = useRef(null);
  const typingRef = useRef(false);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTyping = useCallback(() => {
    if (!typingRef.current) {
      typingRef.current = true;
      onTypingStart();
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      typingRef.current = false;
      onTypingStop();
    }, 1500);
  }, [onTypingStart, onTypingStop]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (e.target.value) handleTyping();
    else {
      clearTimeout(typingTimerRef.current);
      if (typingRef.current) {
        typingRef.current = false;
        onTypingStop();
      }
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Button pulse animation
    gsap.timeline()
      .to(btnRef.current, { scale: 0.88, duration: 0.1, ease: 'power2.in' })
      .to(btnRef.current, { scale: 1, duration: 0.3, ease: 'elastic.out(2, 0.5)' });

    onSend(trimmed);
    setText('');

    // Stop typing
    clearTimeout(typingTimerRef.current);
    if (typingRef.current) {
      typingRef.current = false;
      onTypingStop();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleBtnHover = (entering) => {
    if (!text.trim()) return;
    gsap.to(btnRef.current, {
      scale: entering ? 1.08 : 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <textarea
          id="message-input"
          ref={inputRef}
          className={styles.textarea}
          placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง)"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
        />
        <button
          id="send-btn"
          ref={btnRef}
          className={`${styles.sendBtn} ${text.trim() ? styles.sendBtnActive : ''}`}
          onClick={handleSubmit}
          disabled={!text.trim()}
          onMouseEnter={() => handleBtnHover(true)}
          onMouseLeave={() => handleBtnHover(false)}
          aria-label="ส่งข้อความ"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
