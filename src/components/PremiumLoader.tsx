'use client';

interface PremiumLoaderProps {
  message?: string;
  submessage?: string;
}

export default function PremiumLoader({ message = 'Loading...', submessage }: PremiumLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-sm animate-fade-in">
      <div className="text-center">
        {/* Premium Loader */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dark-800" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          {/* Inner glow */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-500/20 to-accent/20 animate-pulse" />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
          {message}
        </h3>
        {submessage && (
          <p className="text-dark-400 max-w-md">{submessage}</p>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
