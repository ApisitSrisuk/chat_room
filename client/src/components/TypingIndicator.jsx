import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './TypingIndicator.module.css';

export default function TypingIndicator({ typers }) {
  const containerRef = useRef(null);
  const dot1 = useRef(null);
  const dot2 = useRef(null);
  const dot3 = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (typers.length === 0) {
      gsap.to(containerRef.current, { opacity: 0, y: 8, duration: 0.25, ease: 'power2.in' });
      tlRef.current?.kill();
      return;
    }

    gsap.to(containerRef.current, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });

    // Bouncing dots
    tlRef.current?.kill();
    tlRef.current = gsap.timeline({ repeat: -1 });
    [dot1.current, dot2.current, dot3.current].forEach((dot, i) => {
      tlRef.current.to(dot, {
        y: -6,
        duration: 0.35,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      }, i * 0.12);
    });

    return () => tlRef.current?.kill();
  }, [typers.length]);

  if (typers.length === 0) return <div ref={containerRef} style={{ opacity: 0 }} />;

  const label = typers.length === 1
    ? `${typers[0]} กำลังพิมพ์...`
    : `${typers.slice(0, -1).join(', ')} และ ${typers[typers.length - 1]} กำลังพิมพ์...`;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.dots}>
        <span className={styles.dot} ref={dot1} />
        <span className={styles.dot} ref={dot2} />
        <span className={styles.dot} ref={dot3} />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
