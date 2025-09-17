import Image from 'next/image';

type LogoProps = {
  size?: number;
  variant?: 'mark' | 'full';
  className?: string;
};

const Logo = ({ variant = 'full', size, className = '' }: LogoProps) => {
  const markDefaultSize = 105;
  const fullDefaultWidth = 850;
  const fullDefaultHeight = 253;

  if (variant === 'mark') {
    const markSize = size ?? markDefaultSize;
    return (
      <span className={className}>
        <Image src="/images/mini_gyul.svg" alt="logo" width={markSize} height={markSize} priority />
      </span>
    );
  }

  const fullWidth = size ?? fullDefaultWidth;
  const fullHeight = (fullWidth / fullDefaultWidth) * fullDefaultHeight;

  return (
    <Image
      src="/logo.svg"
      alt="logo"
      width={fullWidth}
      height={fullHeight}
      priority
      className={className}
    />
  );
};

export default Logo;
