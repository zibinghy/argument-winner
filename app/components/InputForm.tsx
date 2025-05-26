import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (opponentWords: string, intensity: number) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [opponentWords, setOpponentWords] = useState('');
  const [intensity, setIntensity] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (opponentWords.trim()) {
      onSubmit(opponentWords, intensity);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wechat-card">
      <div className="mb-4">
        <label htmlFor="opponentWords" className="block text-wechat-text font-medium mb-2">
          对方说了什么？
        </label>
        <textarea
          id="opponentWords"
          value={opponentWords}
          onChange={(e) => setOpponentWords(e.target.value)}
          className="wechat-input min-h-[100px]"
          placeholder="输入对方的话..."
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="intensity" className="block text-wechat-text font-medium mb-2">
          语气强烈程度: {intensity}
        </label>
        <input
          type="range"
          id="intensity"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className="wechat-slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>温和</span>
          <span>强烈</span>
        </div>
      </div>

      <button
        type="submit"
        className="wechat-button w-full"
        disabled={isLoading}
      >
        {isLoading ? '生成中...' : '开始吵架'}
      </button>
    </form>
  );
};

export default InputForm; 