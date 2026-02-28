import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-14 h-10',
    md: 'w-20 h-14',
    lg: 'w-28 h-20',
    xl: 'w-48 h-32',
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
