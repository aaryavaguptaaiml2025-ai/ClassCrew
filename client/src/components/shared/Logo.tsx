import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export const ClassCrewLogo: React.FC<LogoProps> = ({
  size = 36,
  showText = false,
  className = '',
  textClassName = '',
}) => {
  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="classcrew-logo-gradient" x1="20" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Outer Triangular Base */}
        <path
          d="M 32 160 L 158 160 L 100 28 L 32 160 Z"
          stroke="url(#classcrew-logo-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Layered Ribbon Structure */}
        <path
          d="M 60 160 L 100 78 L 132 128"
          stroke="url(#classcrew-logo-gradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 72 136 L 118 136 M 84 112 L 100 88"
          stroke="url(#classcrew-logo-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upward Growth Arrow */}
        <path
          d="M 122 122 L 180 64 M 180 64 L 152 64 M 180 64 L 180 92"
          stroke="url(#classcrew-logo-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span
          className={textClassName}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: `${Math.max(14, size * 0.45)}px`,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
          }}
        >
          CLASS CREW
        </span>
      )}
    </div>
  );
};

export default ClassCrewLogo;
