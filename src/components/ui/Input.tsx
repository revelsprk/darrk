import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, type = "text", className = "" }) => {
  return (
    <div className="flex flex-col">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 h-10 rounded-md border shadow-sm bg-white border-zinc-200 focus:ring-2 focus:border-blue-400 placeholder:text-zinc-400 focus:ring-blue-50 duration-200 outline-none ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;