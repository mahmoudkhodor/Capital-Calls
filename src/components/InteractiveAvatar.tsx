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

  // Calculate pupil position based on cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current || !usernameFocused) return;

      const avatarRect = avatarRef.current.getBoundingClientRect();
      const centerX = avatarRect.left + avatarRect.width / 2;
      const centerY = avatarRect.top + avatarRect.height / 2;

      const deltaX = (e.clientX - centerX) / (avatarRect.width / 2);
      const deltaY = (e.clientY - centerY) / (avatarRect.height / 2);

      // Clamp values to keep pupils within eyes
      const maxOffset = 4;
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
  }, [usernameFocused]);

  return (
    <svg
      ref={avatarRef}
      viewBox="0 0 200 220"
      className="w-48 h-52 mx-auto mb-6 drop-shadow-xl"
      style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
    >
      {/* Face */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="#FFD93D"
        stroke="#E5B92E"
        strokeWidth="3"
      />

      {/* Blush */}
      <ellipse cx="45" cy="115" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="155" cy="115" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />

      {/* Eyes Background (white) */}
      <ellipse cx="70" cy="85" rx="20" ry="22" fill="white" />
      <ellipse cx="130" cy="85" rx="20" ry="22" fill="white" />

      {/* Pupils - move with cursor when username focused */}
      <circle
        cx={70 + pupilPosition.x}
        cy={85 + pupilPosition.y}
        r="10"
        fill="#2D3748"
      />
      <circle
        cx={130 + pupilPosition.x}
        cy={85 + pupilPosition.y}
        r="10"
        fill="#2D3748"
      />

      {/* Eye highlights */}
      <circle
        cx={65 + pupilPosition.x}
        cy={80 + pupilPosition.y}
        r="3"
        fill="white"
        opacity="0.8"
      />
      <circle
        cx={125 + pupilPosition.x}
        cy={80 + pupilPosition.y}
        r="3"
        fill="white"
        opacity="0.8"
      />

      {/* Eyebrows */}
      <path
        d={usernameFocused
          ? "M 50 55 Q 70 50 90 55"
          : "M 50 60 Q 70 55 90 60"
        }
        stroke="#8B6914"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-300"
      />
      <path
        d={usernameFocused
          ? "M 110 55 Q 130 50 150 55"
          : "M 110 60 Q 130 55 150 60"
        }
        stroke="#8B6914"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-300"
      />

      {/* Hands - cover eyes when password focused (not peeking) */}
      <g
        className="transition-all duration-500 ease-out"
        style={{
          transform: passwordFocused && !isPeeking ? 'translateY(0)' : 'translateY(40px)',
          opacity: passwordFocused && !isPeeking ? 1 : 0,
        }}
      >
        {/* Left Hand */}
        <ellipse cx="55" cy="75" rx="25" ry="30" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        {/* Fingers */}
        <ellipse cx="40" cy="55" rx="8" ry="15" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="55" cy="48" rx="8" ry="18" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="70" cy="52" rx="8" ry="16" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />

        {/* Right Hand */}
        <ellipse cx="145" cy="75" rx="25" ry="30" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        {/* Fingers */}
        <ellipse cx="130" cy="55" rx="8" ry="15" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="145" cy="48" rx="8" ry="18" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="160" cy="52" rx="8" ry="16" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
      </g>

      {/* Peeking Hands - show when show password is enabled with password */}
      <g
        className="transition-all duration-500 ease-out"
        style={{
          transform: isPeeking ? 'translateY(10px)' : 'translateY(60px)',
          opacity: isPeeking ? 1 : 0,
        }}
      >
        {/* Left Peeking Hand */}
        <ellipse cx="50" cy="80" rx="20" ry="25" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="38" cy="62" rx="6" ry="12" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="50" cy="58" rx="6" ry="14" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="62" cy="62" rx="6" ry="12" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />

        {/* Right Peeking Hand */}
        <ellipse cx="150" cy="80" rx="20" ry="25" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="138" cy="62" rx="6" ry="12" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="150" cy="58" rx="6" ry="14" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
        <ellipse cx="162" cy="62" rx="6" ry="12" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />

        {/* Peeking Eyes - visible through fingers */}
        <ellipse cx="70" cy="88" rx="8" ry="10" fill="white" />
        <ellipse cx="130" cy="88" rx="8" ry="10" fill="white" />
        <circle cx="70" cy="88" r="4" fill="#2D3748" />
        <circle cx="130" cy="88" r="4" fill="#2D3748" />
      </g>

      {/* Nose */}
      <ellipse cx="100" cy="115" rx="8" ry="10" fill="#F4C430" />

      {/* Mouth */}
      {passwordFocused && !isPeeking ? (
        // Worried mouth when covering eyes
        <path
          d="M 75 145 Q 100 135 125 145"
          stroke="#8B6914"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : isPeeking ? (
        // Smirk when peeking
        <path
          d="M 80 145 Q 100 155 120 145"
          stroke="#8B6914"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : usernameFocused ? (
        // Smile when typing username
        <path
          d="M 70 145 Q 100 165 130 145"
          stroke="#8B6914"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        // Default neutral mouth
        <path
          d="M 80 148 Q 100 150 120 148"
          stroke="#8B6914"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Ears */}
      <ellipse cx="20" cy="100" rx="10" ry="18" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />
      <ellipse cx="180" cy="100" rx="10" ry="18" fill="#FFD93D" stroke="#E5B92E" strokeWidth="2" />

      {/* Hair */}
      <path
        d="M 30 70 Q 50 30 100 25 Q 150 30 170 70 Q 160 50 100 45 Q 40 50 30 70"
        fill="#8B4513"
      />
      <path
        d="M 40 65 Q 60 35 100 30 Q 140 35 160 65"
        fill="#A0522D"
      />
    </svg>
  );
}
