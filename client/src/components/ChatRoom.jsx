import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useSocket } from '../hooks/useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import Notification from './Notification';
const uuidv4 = () => crypto.randomUUID();
import styles from './ChatRoom.module.css';

export default function ChatRoom({ username, room, currentUser, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typers, setTypers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { on, off, sendMessage, emitTypingStart, emitTypingStop } = useSocket();

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  // ── Entrance Animation ───────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(containerRef.current,
      { opacity: 0, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.5 }
    );
    tl.fromTo(headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4 },
      '-=0.3'
    );
    tl.fromTo(bodyRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45 },
      '-=0.25'
    );
  }, []);

  // ── Socket Events ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMessageReceive = (msg) => {
      setMessages((prev) => [...prev, { ...msg, id: msg.id || uuidv4() }]);
    };

    const handleUserJoined = ({ users: newUsers, joiner, message }) => {
      setUsers(newUsers);
      if (joiner) {
        addNotification('join', message);
      }
    };

    const handleUserLeft = ({ users: newUsers, message }) => {
      setUsers(newUsers);
      addNotification('leave', message);
    };

    const handleTypingUpdate = ({ typers: newTypers }) => {
      // Filter out self
      setTypers(newTypers.filter((t) => t !== username));
    };

    on('message:receive', handleMessageReceive);
    on('user:joined', handleUserJoined);
    on('user:left', handleUserLeft);
    on('typing:update', handleTypingUpdate);

    return () => {
      off('message:receive', handleMessageReceive);
      off('user:joined', handleUserJoined);
      off('user:left', handleUserLeft);
      off('typing:update', handleTypingUpdate);
    };
  }, [on, off, username]);

  const addNotification = (type, message) => {
    const id = uuidv4();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3600);
  };

  const handleSend = useCallback((text) => {
    sendMessage(text, room);
  }, [sendMessage, room]);

  const handleTypingStart = useCallback(() => {
    emitTypingStart(room);
  }, [emitTypingStart, room]);

  const handleTypingStop = useCallback(() => {
    emitTypingStop(room);
  }, [emitTypingStop, room]);

  const handleLeave = () => {
    const tl = gsap.timeline({ onComplete: onLeave });
    tl.to(containerRef.current, { opacity: 0, scale: 0.95, duration: 0.35, ease: 'power2.in' });
  };

  return (
    <>
      <Notification notifications={notifications} />
      <div className={styles.container} ref={containerRef}>
        {/* Header */}
        <header className={styles.header} ref={headerRef}>
          <div className={styles.headerLeft}>
            <div className={styles.roomIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="rgba(99,102,241,0.2)" />
              </svg>
            </div>
            <div>
              <h2 className={styles.roomName}># {room}</h2>
              <span className={styles.roomSub}>{users.length} คนออนไลน์</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.selfBadge}>
              <span className={styles.selfAvatar} style={{ background: currentUser?.color }}>
                {username.slice(0, 2).toUpperCase()}
              </span>
              <span className={styles.selfName}>{username}</span>
            </div>
            <button id="leave-btn" className={styles.leaveBtn} onClick={handleLeave} title="ออกจากห้อง">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              ออก
            </button>
          </div>
        </header>

        {/* Body */}
        <div className={styles.body} ref={bodyRef}>
          <UserList users={users} currentUser={currentUser} />
          <div className={styles.main}>
            <MessageList messages={messages} typers={typers} />
            <MessageInput
              onSend={handleSend}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </div>
        </div>
      </div>
    </>
  );
}
