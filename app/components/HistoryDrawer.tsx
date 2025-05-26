import React, { useEffect, useState } from 'react';

interface HistoryItem {
  date: string;
  responses: string[];
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      // 只有在抽屉打开时才读取历史记录
      const savedHistory = JSON.parse(localStorage.getItem('argumentHistory') || '[]');
      setHistory(savedHistory);
    }
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const clearHistory = () => {
    localStorage.removeItem('argumentHistory');
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">历史记录</h2>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-red-500 text-sm">
                清空
              </button>
            )}
            <button onClick={onClose} className="text-wechat-text">
              关闭
            </button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            暂无历史记录
          </div>
        ) : (
          <div className="p-4">
            {history.map((item, index) => (
              <div key={index} className="wechat-card">
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(item.date)}
                </div>
                <div>
                  {item.responses.map((response, respIndex) => (
                    <div key={respIndex} className="wechat-bubble mb-2">
                      {response}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDrawer; 