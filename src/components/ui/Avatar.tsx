import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg'; // sizeはオプションにしてデフォルト値を設定
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  // sizeに応じたTailwind CSSのクラスを設定
  const sizeClasses: { [key in 'sm' | 'md' | 'lg']: string } = {
    sm: 'w-4 h-4',  // small size
    md: 'w-8 h-8',  // medium size
    lg: 'w-16 h-16', // large size
  };

  const imageUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${name}`;

  return (
    <img
      src={imageUrl}
      alt="^_^"
      className={`select-none aspect-square bg-white rounded-md ${sizeClasses[size]}`}
    />
  );
};

export default Avatar;