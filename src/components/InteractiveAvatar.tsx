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
  const [handY, setHandY] = useState(80); // Start with hands away
  const [peekFingers, setPeekFingers] = useState(false);

  // Eyes follow cursor when username focused (NO hands yet)
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

  // Handle hands covering/peeking
  useEffect(() => {
    if (passwordFocused && showPassword && hasPassword) {
      // Peeking - hands partly lifted, a few fingers up
      setHandY(55);
      setPeekFingers(true);
    } else if (passwordFocused) {
      // Cover eyes with hands
      setHandY(25);
      setPeekFingers(false);
    } else {
      // No hands - away from face
      setHandY(80);
      setPeekFingers(false);
    }
  }, [passwordFocused, showPassword, hasPassword]);

  // Reset pupils when not focused
  useEffect(() => {
    if (!usernameFocused) {
      setPupilPosition({ x: 0, y: 0 });
    }
  }, [usernameFocused]);

  return (
    <svg
      ref={avatarRef}
      viewBox="0 0 200 220"
      className="w-36 h-40 mx-auto mb-6"
      style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))' }}
    >
      <defs>
        {/* Cute AI robot colors */}
        <linearGradient id="botBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        <linearGradient id="botHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e1065" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>

        <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        <linearGradient id="fingerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#581c87" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="100" y1="20" x2="100" y2="45" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="16" r="5" fill="#a78bfa" filter="url(#glow)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Head - rounded cute bot */}
      <ellipse cx="100" cy="95" rx="65" ry="60" fill="url(#botHead)" stroke="#8b5cf6" strokeWidth="2" />

      {/* Face plate */}
      <ellipse cx="100" cy="100" rx="50" ry="45" fill="#0f0f23" stroke="#4c1d95" strokeWidth="1" />

      {/* Left Eye */}
      <circle cx="70" cy="90" r="18" fill="#1a1a2e" stroke="#8b5cf6" strokeWidth="1.5" />
      <circle cx={70 + pupilPosition.x} cy={90 + pupilPosition.y} r="10" fill="url(#eyeGradient)" filter="url(#glow)" />
      <circle cx={65 + pupilPosition.x} cy={85 + pupilPosition.y} r="3" fill="white" opacity="0.9" />

      {/* Right Eye */}
      <circle cx="130" cy="90" r="18" fill="#1a1a2e" stroke="#8b5cf6" strokeWidth="1.5" />
      <circle cx={130 + pupilPosition.x} cy={90 + pupilPosition.y} r="10" fill="url(#eyeGradient)" filter="url(#glow)" />
      <circle cx={125 + pupilPosition.x} cy={85 + pupilPosition.y} r="3" fill="white" opacity="0.9" />

      {/* Hands covering eyes - animated */}
      <g className="transition-transform duration-400 ease-out" style={{ transform: `translateY(${handY}px)` }}>
        {/* Left Hand - 4 fingers, can spread for peeking */}
        <g>
          {/* Palm */}
          <ellipse cx="50" cy="80" rx="16" ry="18" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1.5" />
          {/* Fingers spread - when peeking, middle fingers lift */}
          <rect x="32" y={peekFingers ? 55 : 50} width="7" height="22" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform={peekFingers ? "rotate(-15 35 60)" : "rotate(-25 35 60)"} className="transition-all duration-300" />
          <rect x="40" y={peekFingers ? 45 : 42} width="7" height="26" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform="rotate(-8 43 48)" className="transition-all duration-300" />
          <rect x="50" y={peekFingers ? 40 : 40} width="7" height="28" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" className="transition-all duration-300" />
          <rect x="60" y={peekFingers ? 45 : 42} width="7" height="26" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform="rotate(8 63 48)" className="transition-all duration-300" />
          <rect x="68" y={peekFingers ? 55 : 50} width="7" height="22" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform={peekFingers ? "rotate(15 71 60)" : "rotate(25 71 60)"} className="transition-all duration-300" />
        </g>

        {/* Right Hand */}
        <g>
          <ellipse cx="150" cy="80" rx="16" ry="18" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1.5" />
          <rect x="132" y={peekFingers ? 55 : 50} width="7" height="22" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform={peekFingers ? "rotate(15 135 60)" : "rotate(25 135 60)"} className="transition-all duration-300" />
          <rect x="140" y={peekFingers ? 45 : 42} width="7" height="26" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform="rotate(8 143 48)" className="transition-all duration-300" />
          <rect x="150" y={peekFingers ? 40 : 40} width="7" height="28" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" className="transition-all duration-300" />
          <rect x="160" y={peekFingers ? 45 : 42} width="7" height="26" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform="rotate(-8 163 48)" className="transition-all duration-300" />
          <rect x="168" y={peekFingers ? 55 : 50} width="7" height="22" rx="3.5" fill="url(#fingerGradient)" stroke="#8b5cf6" strokeWidth="1" transform={peekFingers ? "rotate(-15 171 60)" : "rotate(-25 171 60)"} className="transition-all duration-300" />
        </g>
      </g>

      {/* Small peek eyes - visible when peeking through fingers */}
      <g style={{ opacity: peekFingers ? 1 : 0, transition: 'opacity 0.3s' }}>
        {/* Left peeking eyes */}
        <circle cx="60" cy="95" r="4" fill="url(#eyeGradient)" filter="url(#glow)" />
        <circle cx="75" cy="95" r="4" fill="url(#eyeGradient)" filter="url(#glow)" />
        {/* Right peeking eyes */}
        <circle cx="125" cy="95" r="4" fill="url(#eyeGradient)" filter="url(#glow)" />
        <circle cx="140" cy="95" r="4" fill="url(#eyeGradient)" filter="url(#glow)" />
      </g>

      {/* Mouth - varies by state */}
      {passwordFocused && !peekFingers ? (
        // Worried when covering eyes
        <path d="M 88 135 Q 100 130 112 135" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : peekFingers ? (
        // Cheeky smirk when peeking
        <path d="M 85 133 Q 100 142 115 133" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : usernameFocused ? (
        // Happy smile when typing
        <path d="M 80 130 Q 100 148 120 130" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        // Default cute smile
        <path d="M 88 135 Q 100 140 112 135" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Blush - when typing username */}
      <ellipse cx="55" cy="115" rx="10" ry="6" fill="#c084fc" opacity={usernameFocused ? 0.5 : 0.15}>
        <animate attributeName="opacity" values={usernameFocused ? "0.5;0.7;0.5" : "0.15"} dur="1.2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="145" cy="115" rx="10" ry="6" fill="#c084fc" opacity={usernameFocused ? 0.5 : 0.15}>
        <animate attributeName="opacity" values={usernameFocused ? "0.5;0.7;0.5" : "0.15"} dur="1.2s" repeatCount="indefinite" />
      </ellipse>

      {/* Side ears/speakers */}
      <rect x="25" y="80" width="10" height="35" rx="5" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" />
      <rect x="165" y="80" width="10" height="35" rx="5" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" />

      {/* Ear lights */}
      <circle cx="30" cy="88" r="3" fill="#8b5cf6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="88" r="3" fill="#8b5cf6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Neck */}
      <rect x="85" y="150" width="30" height="20" rx="6" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" />

      {/* Neck lights */}
      <circle cx="93" cy="160" r="3" fill="#34d399" filter="url(#glow)" />
      <circle cx="107" cy="160" r="3" fill="#34d399" filter="url(#glow)" />
    </svg>
  );
}
