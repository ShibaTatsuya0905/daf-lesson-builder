import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mousePosition = useRef({ x: -100, y: -100 });
  const currentPosition = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, select, [role="button"], .cursor-pointer, input, textarea, tr[onClick]');
      setIsHovered(!!interactive);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId: number;

    const render = () => {
      currentPosition.current.x += (mousePosition.current.x - currentPosition.current.x) * 0.22;
      currentPosition.current.y += (mousePosition.current.y - currentPosition.current.y) * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none">
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 -ml-4 -mt-4 transition-transform duration-75 ease-out will-change-transform ${
          isClicked ? 'scale-90' : isHovered ? 'scale-125' : 'scale-100'
        }`}
      >
        {isHovered ? (
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            <path d="M6 10L12 8L10 14Z" fill="#8B5CF6" stroke="#4C1D95" strokeWidth="1.5" />
            <path d="M42 22C42 22 45 28 41 33C37 38 31 35 31 35" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <path d="M38 27C38 27 40 30 38 32" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 36C12 28 16 22 24 22C32 22 36 28 36 36C36 41 32 44 24 44C16 44 12 41 12 36Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M17 32C17 28 20 26 24 26C28 26 31 28 31 32C31 38 28 41 24 41C20 41 17 38 17 32Z" fill="#F8FAFC" />
            <path d="M9 22C7 20 8 16 11 18" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <path d="M39 22C41 20 40 16 37 18" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 16L12 11C12 11 17 10 19 14" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
            <path d="M34 16L36 11C36 11 31 10 29 14" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
            <path d="M10 20C10 14 15 11 24 11C33 11 38 14 38 20C38 26 33 28 24 28C15 28 10 26 10 20Z" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M13 20C13 18 16 17 19 18C21 19 21 21 19 22C16 23 13 22 13 20Z" fill="#334155" />
            <path d="M35 20C35 18 32 17 29 18C27 19 27 21 29 22C32 23 35 22 35 20Z" fill="#334155" />
            <circle cx="17" cy="19" r="1.8" fill="#0F172A" />
            <circle cx="17.5" cy="18.5" r="0.6" fill="#FFFFFF" />
            <circle cx="31" cy="19" r="1.8" fill="#0F172A" />
            <circle cx="31.5" cy="18.5" r="0.6" fill="#FFFFFF" />
            <ellipse cx="24" cy="21" rx="1.5" ry="1.2" fill="#0F172A" />
            <path d="M21 23C21 23 22 27 24 27C26 27 27 23 27 23" fill="#EC4899" stroke="#1E293B" strokeWidth="1.5" />
            <ellipse cx="13" cy="22" rx="1.8" ry="1" fill="#F43F5E" opacity="0.6" />
            <ellipse cx="35" cy="22" rx="1.8" ry="1" fill="#F43F5E" opacity="0.6" />
            <circle cx="18" cy="42" r="3.5" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
            <circle cx="30" cy="42" r="3.5" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M7 11L12 10L10 15Z" fill="#8B5CF6" stroke="#4C1D95" strokeWidth="1.2" />
            <path d="M34 38C38 38 42 35 41 31C40 28 35 29 32 32" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <path d="M37 34C37 34 38 32 36 31" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M14 34C14 27 17 23 24 23C31 23 34 27 34 34C34 40 31 43 24 43C17 43 14 40 14 34Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M18 31C18 28 20 27 24 27C28 27 30 28 30 31C30 37 28 40 24 40C20 40 18 37 18 31Z" fill="#F8FAFC" />
            <path d="M19 32C19 33 21 34 24 34C27 34 29 33 29 32" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M15 15L13 11C13 11 18 10 20 13" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
            <path d="M33 15L35 11C35 11 30 10 28 13" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
            <path d="M11 19C11 14 16 11 24 11C32 11 37 14 37 19C37 25 32 27 24 27C16 27 11 25 11 19Z" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M13 19C13 17 16 16 19 17C21 18 21 20 19 21C16 22 13 21 13 19Z" fill="#334155" />
            <path d="M35 19C35 17 32 16 29 17C27 18 27 20 29 21C32 22 35 21 35 19Z" fill="#334155" />
            <circle cx="17.5" cy="19" r="1.6" fill="#0F172A" />
            <circle cx="18" cy="18.5" r="0.5" fill="#FFFFFF" />
            <circle cx="30.5" cy="19" r="1.6" fill="#0F172A" />
            <circle cx="31" cy="18.5" r="0.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="20.5" rx="1.5" ry="1.2" fill="#0F172A" />
            <path d="M22 22C22 22 23 23 24 23C25 23 26 22 26 22" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
            <ellipse cx="14" cy="21" rx="1.5" ry="0.8" fill="#F43F5E" opacity="0.5" />
            <ellipse cx="34" cy="21" rx="1.5" ry="0.8" fill="#F43F5E" opacity="0.5" />
            <circle cx="16" cy="41" r="3" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
            <circle cx="32" cy="41" r="3" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
          </svg>
        )}
      </div>
    </div>
  );
};