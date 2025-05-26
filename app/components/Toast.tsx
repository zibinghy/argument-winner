import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 2000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待淡出动画完成后再移除
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // 根据类型设置不同的样式
  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'bg-wechat-green';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-wechat-green';
    }
  };

  return (
    <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full 
                    text-white shadow-md z-50 transition-opacity duration-300
                    ${isVisible ? 'opacity-90' : 'opacity-0'} ${getTypeClass()}`}>
      {message}
    </div>
  );
};

export default Toast; 