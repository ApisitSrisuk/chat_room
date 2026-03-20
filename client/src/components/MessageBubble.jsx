import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './MessageBubble.module.css';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

export default function MessageBubble({ message, showAvatar }) {
  const { username, text, timestamp, self, color } = message;
  const bubbleRef = useRef(null);

  // ── Pop-In Animation ───────────────────────────────────────────────────
  useEffect(() => {
    const el = bubbleRef.current;
    if (!el) return;

    gsap.fromTo(el,
      {
        opacity: 0,
        scale: 0.75,
        y: 20,
        x: self ? 20 : -20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        duration: 0.45,
        ease: 'back.out(1.7)',
      }
    );
  }, []);

  if (message.system) {
    return (
      <div className={styles.systemMsg} ref={bubbleRef}>
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.wrapper} ${self ? styles.wrapperSelf : styles.wrapperOther}`}
      ref={bubbleRef}
    >
      {/* Avatar — only for other users */}
      {!self && (
        <div className={styles.avatar} style={{ background: color }}>
          {getInitials(username)}
        </div>
      )}

      <div className={styles.content}>
        {!self && showAvatar && (
          <span className={styles.username} style={{ color }}>{username}</span>
        )}

        <div className={`${styles.bubble} ${self ? styles.bubbleSelf : styles.bubbleOther}`}>
          <p className={styles.text}>{text}</p>
        </div>

        <span className={styles.time}>{formatTime(timestamp)}</span>
      </div>
    </div>
  );
}
