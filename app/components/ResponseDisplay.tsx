import React, { useState, useEffect, useRef } from 'react';
import Toast from './Toast';

interface ResponseDisplayProps {
  responses: string[];
  isLoading: boolean;
  isTyping: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ 
  responses, 
  isLoading,
  isTyping
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const responsesRef = useRef<HTMLDivElement>(null);

  // 当有新回复时，滚动到最新回复
  useEffect(() => {
    if (responsesRef.current && responses.length > 0) {
      const lastBubble = responsesRef.current.lastElementChild;
      if (lastBubble) {
        lastBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [responses]);

  if (isLoading) {
    return (
      <div className="wechat-card mt-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wechat-green"></div>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return null;
  }

  const saveToHistory = () => {
    // 保存到历史记录
    const history = JSON.parse(localStorage.getItem('argumentHistory') || '[]');
    history.push({
      date: new Date().toISOString(),
      responses
    });
    localStorage.setItem('argumentHistory', JSON.stringify(history));
    
    // 显示提示
    setToastMessage('已保存到历史记录');
    setShowToast(true);
  };

  const shareResponses = () => {
    if (navigator.share) {
      navigator.share({
        title: '吵架包赢',
        text: responses.join('\n\n')
      });
    } else {
      navigator.clipboard.writeText(responses.join('\n\n'));
      setToastMessage('已复制到剪贴板');
      setShowToast(true);
    }
  };

  return (
    <div className="wechat-card mt-6">
      <h2 className="text-lg font-medium mb-4">最佳回复：</h2>
      <div className="flex flex-col items-end space-y-3" ref={responsesRef}>
        {responses.map((response, index) => (
          <div 
            key={index} 
            className={`wechat-bubble ${isTyping && index === responses.length - 1 ? 'typing-effect' : ''}`}
            style={{
              minWidth: '100px',
              maxWidth: '90%',
              width: 'fit-content',
              transition: 'all 0.2s ease-out'
            }}
          >
            {response}
            {isTyping && index === responses.length - 1 && (
              <span className="typing-cursor"></span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button 
          onClick={saveToHistory}
          className="text-wechat-link text-sm"
        >
          保存到历史
        </button>
        <button
          onClick={shareResponses}
          className="text-wechat-link text-sm"
        >
          分享/复制
        </button>
      </div>

      {showToast && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ResponseDisplay; 