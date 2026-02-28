import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-16',
    xl: 'w-64 h-28',
  };

  return (
    <Link href={href} className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      <Image
        src="/logo.jpg"
        alt="Capital Call"
        fill
        className="object-contain rounded-lg"
      />
    </Link>
  );
}
