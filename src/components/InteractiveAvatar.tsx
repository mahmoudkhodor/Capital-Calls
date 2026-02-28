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
  const [isBlushing, setIsBlushing] = useState(false);

  // Calculate pupil position based on cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current || !usernameFocused) return;

      const avatarRect = avatarRef.current.getBoundingClientRect();
      const centerX = avatarRect.left + avatarRect.width / 2;
      const centerY = avatarRect.top + avatarRect.height / 2;

      const deltaX = (e.clientX - centerX) / (avatarRect.width / 2);
      const deltaY = (e.clientY - centerY) / (avatarRect.height / 2);

      const maxOffset = 6;
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

  // Determine avatar state
  useEffect(() => {
    if (passwordFocused && showPassword && hasPassword) {
      setIsPeeking(true);
    } else if (passwordFocused) {
      setIsPeeking(false);
    } else {
      setIsPeeking(false);
    }
  }, [passwordFocused, showPassword, hasPassword]);

  // Reset pupil when not focused on username
  useEffect(() => {
    if (!usernameFocused) {
      setPupilPosition({ x: 0, y: 0 });
    }
    setIsBlushing(usernameFocused);
  }, [usernameFocused]);

  return (
    <svg
      ref={avatarRef}
      viewBox="0 0 200 220"
      className="w-44 h-48 mx-auto mb-6"
      style={{ filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.4))' }}
    >
      <defs>
        {/* Futuristic gradient */}
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* Antenna */}
      <line x1="100" y1="30" x2="100" y2="50" stroke="#6366f1" strokeWidth="2" />
      <circle cx="100" cy="25" r="6" fill="#818cf8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Head - futuristic AI shape */}
      <rect x="35" y="50" width="130" height="130" rx="25" fill="url(#faceGradient)" stroke="#6366f1" strokeWidth="2" />

      {/* Screen/Face plate */}
      <rect x="45" y="70" width="110" height="90" rx="15" fill="url(#screenGradient)" opacity="0.3" />

      {/* Left Eye Ring */}
      <circle cx="70" cy="95" r="20" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.8" />

      {/* Left Pupil - moves with cursor */}
      <circle
        cx={70 + pupilPosition.x}
        cy={95 + pupilPosition.y}
        r="8"
        fill="url(#eyeGlow)"
        filter="url(#glow)"
      />

      {/* Left Eye highlight */}
      <circle
        cx={66 + pupilPosition.x}
        cy={90 + pupilPosition.y}
        r="3"
        fill="white"
        opacity="0.8"
      />

      {/* Right Eye Ring */}
      <circle cx="130" cy="95" r="20" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.8" />

      {/* Right Pupil - moves with cursor */}
      <circle
        cx={130 + pupilPosition.x}
        cy={95 + pupilPosition.y}
        r="8"
        fill="url(#eyeGlow)"
        filter="url(#glow)"
      />

      {/* Right Eye highlight */}
      <circle
        cx={126 + pupilPosition.x}
        cy={90 + pupilPosition.y}
        r="3"
        fill="white"
        opacity="0.8"
      />

      {/* Hands - cover eyes when password focused (not peeking) */}
      <g
        className="transition-all duration-500 ease-out"
        style={{
          transform: passwordFocused && !isPeeking ? 'translateY(0)' : 'translateY(50px)',
          opacity: passwordFocused && !isPeeking ? 1 : 0,
        }}
      >
        {/* Left Hand - robotic fingers */}
        <rect x="45" y="75" width="25" height="40" rx="8" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="47" y="60" width="6" height="20" rx="3" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
        <rect x="55" y="55" width="6" height="25" rx="3" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
        <rect x="63" y="60" width="6" height="20" rx="3" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />

        {/* Right Hand - robotic fingers */}
        <rect x="130" y="75" width="25" height="40" rx="8" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="132" y="60" width="6" height="20" rx="3" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
        <rect x="140" y="55" width="6" height="25" rx="3" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
        <rect x="148" y="60" width="6" height="20" rx="3" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
      </g>

      {/* Peeking Hands - show when show password is enabled */}
      <g
        className="transition-all duration-500 ease-out"
        style={{
          transform: isPeeking ? 'translateY(15px)' : 'translateY(70px)',
          opacity: isPeeking ? 1 : 0,
        }}
      >
        {/* Left Peeking Hand */}
        <rect x="50" y="82" width="20" height="32" rx="6" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="52" y="70" width="5" height="15" rx="2" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
        <rect x="58" y="66" width="5" height="19" rx="2" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />

        {/* Right Peeking Hand */}
        <rect x="130" y="82" width="20" height="32" rx="6" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="132" y="70" width="5" height="15" rx="2" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />
        <rect x="138" y="66" width="5" height="19" rx="2" fill="url(#handGradient)" stroke="#6366f1" strokeWidth="1" />

        {/* Small peeking eyes */}
        <circle cx="70" cy="100" r="5" fill="url(#eyeGlow)" filter="url(#glow)" />
        <circle cx="130" cy="100" r="5" fill="url(#eyeGlow)" filter="url(#glow)" />
      </g>

      {/* Mouth - varies by state */}
      {passwordFocused && !isPeeking ? (
        // Worried - flat line
        <line x1="85" y1="145" x2="115" y2="145" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
      ) : isPeeking ? (
        // Smirk when peeking - slight smile
        <path d="M 80 142 Q 100 150 120 142" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : usernameFocused ? (
        // Big smile when typing
        <path d="M 75 140 Q 100 160 125 140" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        // Default - subtle smile
        <path d="M 85 145 Q 100 150 115 145" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}

      {/* Cheeks - blush effect */}
      <ellipse cx="55" cy="125" rx="8" ry="5" fill="#c084fc" opacity={isBlushing ? 0.4 : 0.15}>
        <animate attributeName="opacity" values={isBlushing ? "0.4;0.6;0.4" : "0.15"} dur="1s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="145" cy="125" rx="8" ry="5" fill="#c084fc" opacity={isBlushing ? 0.4 : 0.15}>
        <animate attributeName="opacity" values={isBlushing ? "0.4;0.6;0.4" : "0.15"} dur="1s" repeatCount="indefinite" />
      </ellipse>

      {/* Ears/Antennae sides */}
      <rect x="25" y="90" width="10" height="40" rx="5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="165" y="90" width="10" height="40" rx="5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />

      {/* Ear lights */}
      <circle cx="30" cy="100" r="3" fill="#818cf8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="100" r="3" fill="#818cf8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Neck */}
      <rect x="85" y="175" width="30" height="25" rx="5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />

      {/* Collar lights */}
      <circle cx="92" cy="185" r="3" fill="#4ade80" filter="url(#glow)" />
      <circle cx="108" cy="185" r="3" fill="#4ade80" filter="url(#glow)" />
    </svg>
  );
}
