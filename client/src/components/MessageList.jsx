import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import styles from './MessageList.module.css';

export default function MessageList({ messages, typers }) {
  const endRef = useRef(null);
  const containerRef = useRef(null);
  const prevCountRef = useRef(0);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (messages.length !== prevCountRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevCountRef.current = messages.length;
    }
  }, [messages.length]);

  return (
    <div className={styles.container} ref={containerRef}>
      {messages.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💬</div>
          <p className={styles.emptyText}>ยังไม่มีข้อความ</p>
          <p className={styles.emptySubtext}>เริ่มต้นการสนทนากันเลย!</p>
        </div>
      )}
      <div className={styles.messages}>
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.username !== msg.username || prev.system;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              showAvatar={showAvatar}
            />
          );
        })}
      </div>
      <TypingIndicator typers={typers} />
      <div ref={endRef} />
    </div>
  );
}
