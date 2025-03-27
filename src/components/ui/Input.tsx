import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  className?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, type = "text", className = "", icon }) => {
  return (
    <div className={`flex items-center w-full px-4 h-10 overflow-hidden border-gray-200 rounded-md border shadow-sm bg-white duration-200 focus:ring-2 focus-within:border-blue-400 focus-within:ring-2 ring-blue-50 ${className}`}>
      {icon && (
        <div className="text-gray-400 pr-2">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full outline-none h-10 placeholder:text-gray-400`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;