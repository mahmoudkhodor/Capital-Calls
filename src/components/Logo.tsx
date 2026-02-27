import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Link href={href} className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      <Image
        src="/logo.jpg"
        alt="Capital Call"
        fill
        className="object-contain rounded-xl"
      />
    </Link>
  );
}
