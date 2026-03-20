import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import styles from './JoinScreen.module.css';

const ROOMS = ['general', 'random', 'tech', 'gaming', 'music', 'movies'];

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const formRef = useRef(null);
  const btnRef = useRef(null);
  const bubblesRef = useRef([]);

  // ── Entrance Animation ───────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Floating bg bubbles
    bubblesRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { scale: 0, opacity: 0 });
      tl.to(el, { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)' }, i * 0.15);
    });

    tl.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9 },
      0.2
    );

    tl.fromTo(logoRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      0.5
    );

    tl.fromTo([titleRef.current, subtitleRef.current],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 },
      0.65
    );

    tl.fromTo(formRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      0.85
    );

    tl.fromTo(btnRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
      1.0
    );

    // Continuous ambient float on card
    gsap.to(cardRef.current, {
      y: '-=8',
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Animate bg bubbles floating
    bubblesRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        y: `${-20 - i * 15}px`,
        x: `${(i % 2 === 0 ? 1 : -1) * 10}px`,
        duration: 4 + i * 0.7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.3,
      });
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('กรุณาใส่ชื่อผู้ใช้');
      gsap.fromTo(cardRef.current,
        { x: -8 }, { x: 0, duration: 0.3, ease: 'elastic.out(3, 0.3)', clearProps: 'x' }
      );
      return;
    }

    // Exit animation
    const tl = gsap.timeline({
      onComplete: () => onJoin(username.trim(), room),
    });
    tl.to(cardRef.current, { scale: 0.95, opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' });
    tl.to(containerRef.current, { opacity: 0, duration: 0.3 }, '-=0.15');
  };

  const handleBtnHover = (entering) => {
    gsap.to(btnRef.current, {
      scale: entering ? 1.05 : 1,
      boxShadow: entering
        ? '0 0 30px rgba(99,102,241,0.6), 0 0 60px rgba(99,102,241,0.2)'
        : '0 0 16px rgba(99,102,241,0.3)',
      duration: 0.25,
    });
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Background decorative bubbles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={styles.bubble}
          ref={(el) => (bubblesRef.current[i] = el)}
          style={{
            '--size': `${120 + i * 60}px`,
            '--top': `${10 + i * 15}%`,
            '--left': `${5 + i * 20}%`,
            '--hue': `${240 + i * 20}deg`,
          }}
        />
      ))}

      <div className={styles.card} ref={cardRef}>
        {/* Logo */}
        <div className={styles.logo} ref={logoRef}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(99,102,241,0.2)" />
              <circle cx="8" cy="10" r="1" fill="currentColor" />
              <circle cx="12" cy="10" r="1" fill="currentColor" />
              <circle cx="16" cy="10" r="1" fill="currentColor" />
            </svg>
          </div>
          <span className={styles.logoText}>ChatRoom</span>
        </div>

        <h1 className={styles.title} ref={titleRef}>ยินดีต้อนรับ<span className={styles.wave}>👋</span></h1>
        <p className={styles.subtitle} ref={subtitleRef}>เข้าร่วมห้องแชทและพูดคุยแบบ Real-Time</p>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit} ref={formRef}>
          <div className={styles.field}>
            <label className={styles.label}>ชื่อผู้ใช้</label>
            <input
              id="username-input"
              className={styles.input}
              type="text"
              placeholder="เช่น Alex, Jordan..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              maxLength={24}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>เลือกห้อง</label>
            <div className={styles.roomGrid}>
              {ROOMS.map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`room-${r}`}
                  className={`${styles.roomChip} ${room === r ? styles.roomChipActive : ''}`}
                  onClick={() => setRoom(r)}
                >
                  # {r}
                </button>
              ))}
            </div>
          </div>

          <button
            id="join-btn"
            type="submit"
            className={styles.joinBtn}
            ref={btnRef}
            onMouseEnter={() => handleBtnHover(true)}
            onMouseLeave={() => handleBtnHover(false)}
          >
            <span>เข้าร่วมห้องแชท</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
