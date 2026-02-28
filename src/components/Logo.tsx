import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href={href} className={`${sizeClasses[size]} font-bold text-white`}>
      Capital Call
    </Link>
  );
}
