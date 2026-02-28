import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-40 h-16',
  };

  return (
    <Link href={href} className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      <Image
        src="/logo.jpg"
        alt="Capital Call"
        fill
        className="object-contain"
      />
    </Link>
  );
}
