'use client';

import { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import ResponseDisplay from './components/ResponseDisplay';
import HistoryDrawer from './components/HistoryDrawer';

export default function Home() {
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // 保存EventSource实例的引用
  const eventSourceRef = useRef<EventSource | null>(null);

  // 组件卸载时关闭EventSource连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSubmit = async (opponentWords: string, intensity: number) => {
    setIsLoading(true);
    setError(null);
    setResponses([]);
    
    // 关闭之前的EventSource连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    try {
      // 创建查询参数
      const params = new URLSearchParams({
        opponentWords: opponentWords,
        intensity: intensity.toString()
      });
      
      // 创建新的EventSource连接
      const eventSource = new EventSource(`/api/stream?${params.toString()}`);
      eventSourceRef.current = eventSource;
      
      // 连接成功后可以停止加载指示器并开始显示输入效果
      eventSource.onopen = () => {
        setIsLoading(false);
        setIsTyping(true);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            setError(data.error);
            setIsTyping(false);
            eventSource.close();
            eventSourceRef.current = null;
            return;
          }
          
          if (data.responses) {
            setResponses(data.responses);
          }
          
          if (data.done) {
            setIsTyping(false);
            eventSource.close();
            eventSourceRef.current = null;
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setError('连接出错，请重试');
        setIsTyping(false);
        setIsLoading(false);
        eventSource.close();
        eventSourceRef.current = null;
      };
      
    } catch (err: any) {
      console.error('Error setting up EventSource:', err);
      setError(err.message || '连接失败，请稍后再试');
      setResponses([]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-wechat-text">吵架包赢</h1>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="text-wechat-link"
        >
          历史记录
        </button>
      </div>
      
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <ResponseDisplay 
        responses={responses} 
        isLoading={isLoading} 
        isTyping={isTyping}
      />
      
      <footer className="mt-8 text-center text-xs text-gray-500">
        © 2023 吵架包赢 - 让你在任何争论中都能赢
      </footer>
      
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </main>
  );
} 