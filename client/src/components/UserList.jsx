import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './UserList.module.css';

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

export default function UserList({ users, currentUser }) {
  const listRef = useRef(null);
  const prevCountRef = useRef(0);

  // ── Stagger Animation on user list change ───────────────────────────────
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-user-item]');
    if (items.length === 0) return;

    if (users.length > prevCountRef.current) {
      // New user added — animate the last item
      const lastItem = items[items.length - 1];
      gsap.fromTo(lastItem,
        { x: -24, opacity: 0, scale: 0.85 },
        { x: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }
      );
    } else if (users.length !== prevCountRef.current) {
      // Re-stagger all
      gsap.fromTo(items,
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
    prevCountRef.current = users.length;
  }, [users]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>ออนไลน์</span>
        <span className={styles.count}>{users.length}</span>
      </div>
      <div className={styles.list} ref={listRef}>
        {users.map((user) => {
          const isSelf = user.id === currentUser?.id;
          return (
            <div key={user.id} className={styles.userItem} data-user-item>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar} style={{ background: user.color }}>
                  {getInitials(user.username)}
                </div>
                <span className={styles.onlineDot} />
              </div>
              <div className={styles.info}>
                <span className={styles.name}>
                  {user.username}
                  {isSelf && <span className={styles.selfTag}>คุณ</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
