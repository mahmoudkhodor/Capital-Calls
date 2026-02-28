'use client';

import { useState, useRef, useEffect } from 'react';

interface InteractiveAvatarProps {
  usernameFocused: boolean;
  passwordFocused: boolean;
  showPassword: boolean;
  hasPassword: boolean;
}

export default function InteractiveAvatar({
  usernameFocused,
  passwordFocused,
  showPassword,
  hasPassword
}: InteractiveAvatarProps) {
  const avatarRef = useRef<SVGSVGElement>(null);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);
  const [handOffset, setHandOffset] = useState(50);

  // Calculate pupil position based on cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current || !usernameFocused) return;

      const avatarRect = avatarRef.current.getBoundingClientRect();
      const centerX = avatarRect.left + avatarRect.width / 2;
      const centerY = avatarRect.top + avatarRect.height / 2;

      const deltaX = (e.clientX - centerX) / (avatarRect.width / 2);
      const deltaY = (e.clientY - centerY) / (avatarRect.height / 2);

      const maxOffset = 5;
      const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX * maxOffset));
      const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY * maxOffset));

      setPupilPosition({ x: clampedX, y: clampedY });
    };

    if (usernameFocused) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [usernameFocused]);

  // Animate hand offset for smooth covering/uncovering
  useEffect(() => {
    if (passwordFocused && !isPeeking) {
      const timer = setTimeout(() => setHandOffset(0), 50);
      return () => clearTimeout(timer);
    } else if (isPeeking) {
      const timer = setTimeout(() => setHandOffset(18), 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setHandOffset(50), 50);
      return () => clearTimeout(timer);
    }
  }, [passwordFocused, isPeeking]);

  // Determine peek state
  useEffect(() => {
    if (passwordFocused && showPassword && hasPassword) {
      setIsPeeking(true);
    } else {
      setIsPeeking(false);
    }
  }, [passwordFocused, showPassword, hasPassword]);

  // Reset pupil when not focused on username
  useEffect(() => {
    if (!usernameFocused) {
      setPupilPosition({ x: 0, y: 0 });
    }
  }, [usernameFocused]);

  return (
    <svg
      ref={avatarRef}
      viewBox="0 0 200 220"
      className="w-40 h-44 mx-auto mb-6"
      style={{ filter: 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.5))' }}
    >
      <defs>
        <linearGradient id="aiFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#2e1065" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="100" y1="25" x2="100" y2="50" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="20" r="5" fill="#a78bfa" filter="url(#glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Head */}
      <rect x="40" y="45" width="120" height="120" rx="30" fill="url(#aiFace)" stroke="#6366f1" strokeWidth="2" />

      {/* Face screen */}
      <rect x="50" y="60" width="100" height="80" rx="20" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="1" />

      {/* Left Eye */}
      <ellipse cx="70" cy="90" rx="16" ry="18" fill="#0f0f1a" stroke="#6366f1" strokeWidth="1" />
      <ellipse cx="70" cy="90" rx="14" ry="16" fill="#1a1a2e" />
      <circle cx={70 + pupilPosition.x} cy={90 + pupilPosition.y} r="7" fill="url(#eyeGlow)" filter="url(#glow)" />
      <circle cx={66 + pupilPosition.x} cy={85 + pupilPosition.y} r="2.5" fill="white" opacity="0.9" />

      {/* Right Eye */}
      <ellipse cx="130" cy="90" rx="16" ry="18" fill="#0f0f1a" stroke="#6366f1" strokeWidth="1" />
      <ellipse cx="130" cy="90" rx="14" ry="16" fill="#1a1a2e" />
      <circle cx={130 + pupilPosition.x} cy={90 + pupilPosition.y} r="7" fill="url(#eyeGlow)" filter="url(#glow)" />
      <circle cx={126 + pupilPosition.x} cy={85 + pupilPosition.y} r="2.5" fill="white" opacity="0.9" />

      {/* Hands covering eyes - animated smoothly */}
      <g className="transition-transform duration-500 ease-out" style={{ transform: `translateY(${handOffset}px)` }}>
        {/* Left Hand */}
        <g>
          <ellipse cx="55" cy="75" rx="18" ry="22" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" />
          <rect x="35" y="45" width="8" height="25" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(-20 39 57)" />
          <rect x="45" y="38" width="8" height="30" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(-8 49 53)" />
          <rect x="55" y="35" width="8" height="32" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" />
          <rect x="65" y="40" width="8" height="28" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(10 69 54)" />
          <rect x="73" y="50" width="8" height="22" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(20 77 61)" />
        </g>

        {/* Right Hand */}
        <g>
          <ellipse cx="145" cy="75" rx="18" ry="22" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" />
          <rect x="125" y="45" width="8" height="25" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(20 129 57)" />
          <rect x="135" y="38" width="8" height="30" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(8 139 53)" />
          <rect x="145" y="35" width="8" height="32" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" />
          <rect x="155" y="40" width="8" height="28" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(-10 159 54)" />
          <rect x="163" y="50" width="8" height="22" rx="4" fill="url(#skinGradient)" stroke="#6366f1" strokeWidth="1" transform="rotate(-20 167 61)" />
        </g>
      </g>

      {/* Peeking eyes - only visible when peeking */}
      <g style={{ opacity: isPeeking ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {/* Small eyes peeking through fingers - left */}
        <ellipse cx="65" cy="95" rx="5" ry="6" fill="#1a1a2e" />
        <circle cx="65" cy="95" r="4" fill="url(#eyeGlow)" filter="url(#softGlow)" />
        <circle cx="64" cy="93" r="1.5" fill="white" />

        <ellipse cx="78" cy="95" rx="5" ry="6" fill="#1a1a2e" />
        <circle cx="78" cy="95" r="4" fill="url(#eyeGlow)" filter="url(#softGlow)" />
        <circle cx="77" cy="93" r="1.5" fill="white" />

        {/* Small eyes peeking through fingers - right */}
        <ellipse cx="122" cy="95" rx="5" ry="6" fill="#1a1a2e" />
        <circle cx="122" cy="95" r="4" fill="url(#eyeGlow)" filter="url(#softGlow)" />
        <circle cx="121" cy="93" r="1.5" fill="white" />

        <ellipse cx="135" cy="95" rx="5" ry="6" fill="#1a1a2e" />
        <circle cx="135" cy="95" r="4" fill="url(#eyeGlow)" filter="url(#softGlow)" />
        <circle cx="134" cy="93" r="1.5" fill="white" />
      </g>

      {/* Mouth */}
      {passwordFocused && !isPeeking ? (
        <path d="M 85 145 Q 100 140 115 145" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : isPeeking ? (
        <path d="M 82 143 Q 100 150 118 143" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : usernameFocused ? (
        <path d="M 75 140 Q 100 160 125 140" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 85 145 Q 100 150 115 145" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Blush when typing */}
      <ellipse cx="55" cy="120" rx="10" ry="6" fill="#c084fc" opacity={usernameFocused ? 0.5 : 0.2}>
        <animate attributeName="opacity" values={usernameFocused ? "0.5;0.7;0.5" : "0.2"} dur="1.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="145" cy="120" rx="10" ry="6" fill="#c084fc" opacity={usernameFocused ? 0.5 : 0.2}>
        <animate attributeName="opacity" values={usernameFocused ? "0.5;0.7;0.5" : "0.2"} dur="1.5s" repeatCount="indefinite" />
      </ellipse>

      {/* Side ear pieces */}
      <rect x="28" y="85" width="12" height="50" rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="160" y="85" width="12" height="50" rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />

      {/* Ear lights */}
      <circle cx="34" cy="95" r="3" fill="#818cf8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="166" cy="95" r="3" fill="#818cf8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Neck */}
      <rect x="82" y="160" width="36" height="30" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />

      {/* Neck lights */}
      <circle cx="92" cy="172" r="4" fill="#4ade80" filter="url(#glow)" />
      <circle cx="108" cy="172" r="4" fill="#4ade80" filter="url(#glow)" />
    </svg>
  );
}
