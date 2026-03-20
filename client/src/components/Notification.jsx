import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './Notification.module.css';

export default function Notification({ notifications }) {
  return (
    <div className={styles.stack}>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

function NotificationItem({ notification }) {
  const ref = useRef(null);
  const isJoin = notification.type === 'join';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline();
    // Slide down + fade in
    tl.fromTo(el,
      { y: -40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
    );
    // Hold, then fade out
    tl.to(el, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', delay: 2.8 });
  }, []);

  return (
    <div className={`${styles.item} ${isJoin ? styles.itemJoin : styles.itemLeave}`} ref={ref}>
      <span className={styles.icon}>{isJoin ? '🟢' : '🔴'}</span>
      <span>{notification.message}</span>
    </div>
  );
}
