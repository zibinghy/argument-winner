import OpenAI from 'openai';

// 只从环境变量获取API密钥，不再提供默认值
const API_KEY = process.env.OPENROUTER_API_KEY || '';
const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

// 调试输出API配置（不输出完整密钥）
console.log(`使用API配置：BASE_URL=${BASE_URL}, MODEL=${MODEL}, API_KEY=${API_KEY.substring(0, 4)}...`);

// 创建OpenAI客户端
const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
    'X-Title': 'Argument Winner'
  }
});

// 测试发送一个简单的请求，检查认证是否正常
async function testApiConnection() {
  try {
    // 直接创建请求而不依赖OpenAI库
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'Argument Winner'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    });
    
    const data = await response.json();
    console.log('API连接测试结果:', data.error ? `错误: ${data.error.message}` : '成功');
    return !data.error;
  } catch (error) {
    console.error('API连接测试失败:', error);
    return false;
  }
}

// 尝试测试API连接
testApiConnection().then(isSuccess => {
  console.log(`API连接测试结果: ${isSuccess ? '成功' : '失败'}`);
});

// 根据强度生成不同的提示词
const getPromptByIntensity = (opponentWords: string, intensity: number) => {
  let intensityDesc = "";
  let examples = "";

  if (intensity >= 1 && intensity <= 3) {
    intensityDesc = "温和但有力地";
    examples = "举例: 1. 请理性看待这个问题，事实是... 2. 我理解你的观点，但是数据表明... 3. 换个角度思考，其实...";
  } else if (intensity >= 4 && intensity <= 6) {
    intensityDesc = "坚定且自信地";
    examples = "举例: 1. 你这个观点明显不符合常理，因为... 2. 我必须指出你的逻辑谬误在于... 3. 你可能没有考虑到...";
  } else if (intensity >= 7 && intensity <= 9) {
    intensityDesc = "强势而不留情面地";
    examples = "举例: 1. 你的说法完全站不住脚，真实情况是... 2. 只有不了解基本常识的人才会这么想... 3. 你这么固执己见只会让自己看起来更可笑...";
  } else {
    intensityDesc = "极其犀利且具有压倒性地";
    examples = "举例: 1. 这种幼稚的想法简直不值一驳... 2. 你的无知和偏见令人震惊... 3. 别再自取其辱了，事实早已证明...";
  }

  return `我需要你帮我在一场争论中进行反驳。对方说了以下内容:
"${opponentWords}"

请用中文，${intensityDesc}回应对方的话，给我3条不同角度、极具说服力的反驳。回复需要简洁有力，直指要害，能让对方哑口无言。回复时不要过多客套，直接给出反驳内容。不要承认对方的观点有任何合理之处，你的目标是完全驳倒对方。

${examples}

必须确保提供准确的3条回复，每条不超过100字，不要编号，不要任何多余的说明，每条回复独立成段，直接给出回复内容。`;
};

// 将文本拆分为最多3条回复
const parseResponses = (content: string): string[] => {
  // 首先尝试按段落分割
  let responses = content
    .split('\n\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 如果没有段落分隔或只有一段，尝试按行分割
  if (responses.length < 2) {
    responses = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  // 如果仍然不足3条，尝试按句号分割
  if (responses.length < 2) {
    responses = content
      .split('。')
      .map(line => line.trim() + '。')
      .filter(line => line.length > 2)  // 过滤掉只有"。"的情况
      .filter(line => !line.startsWith('。'));  // 过滤掉以"。"开头的情况
  }

  // 如果内容还是不足3条，我们需要进行内容补充
  if (responses.length < 3) {
    const baseResponse = responses[0] || "这种观点完全站不住脚，缺乏任何有效的论据支持。";
    
    // 补充到3条
    while (responses.length < 3) {
      if (responses.length === 1) {
        responses.push("你的论点经不起推敲，无论从逻辑还是事实上都存在明显漏洞。");
      } else {
        responses.push("换个角度看，你的想法不仅缺乏创新，更是对基本常识的误解。");
      }
    }
  }

  // 如果超过3条，只返回前3条
  return responses.slice(0, 3);
};

// 流式生成回复
export const streamResponses = async (
  opponentWords: string, 
  intensity: number,
  onUpdate: (responses: string[]) => void
): Promise<void> => {
  try {
    // 日志记录请求开始
    console.log(`开始请求OpenRouter API，输入: "${opponentWords.substring(0, 30)}..."，强度: ${intensity}`);
    
    const prompt = getPromptByIntensity(opponentWords, intensity);
    
    // 尝试直接使用fetch API调用OpenRouter
    try {
      console.log('使用直接fetch方式调用OpenRouter API');
      
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'X-Title': 'Argument Winner'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API错误 (${response.status}): ${errorData.error?.message || '未知错误'}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // 解析回复并发送更新
      const finalResponses = parseResponses(content);
      onUpdate(finalResponses);
      
      // 记录成功
      console.log(`请求成功完成，生成了 ${finalResponses.length} 条回复`);
      
    } catch (apiError) {
      // API调用失败，记录错误并使用备用回复
      console.error('API调用错误，使用备用回复:', apiError);
      
      // 生成备用回复
      const fallbackResponses = [
        `看来你对"${opponentWords.substring(0, 20)}..."的理解存在根本性误区，缺乏对基本事实的认知。`,
        `你的观点经不起任何逻辑推敲，这种想法只会让人对你的判断力产生质疑。`,
        `换个角度看，类似的论点早已被事实和数据驳倒过无数次，坚持这种错误只会令人尴尬。`
      ];
      
      // 通知调用者使用备用回复
      onUpdate(fallbackResponses);
    }
    
  } catch (error) {
    console.error('API error:', error);
    throw new Error('生成回复失败，请稍后再试');
  }
};

// 保留原有的非流式API以兼容旧代码
export const generateResponses = async (opponentWords: string, intensity: number): Promise<string[]> => {
  try {
    console.log(`开始非流式请求OpenRouter API，输入: "${opponentWords.substring(0, 30)}..."，强度: ${intensity}`);
    
    const prompt = getPromptByIntensity(opponentWords, intensity);
    
    try {
      console.log('使用直接fetch方式调用OpenRouter API');
      
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'X-Title': 'Argument Winner'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API错误 (${response.status}): ${errorData.error?.message || '未知错误'}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const responses = parseResponses(content);
      
      console.log(`非流式请求成功完成，生成了 ${responses.length} 条回复`);
      return responses;
      
    } catch (apiError) {
      console.error('非流式API调用错误，使用备用回复:', apiError);
      
      // 生成备用回复
      return [
        `看来你对"${opponentWords.substring(0, 20)}..."的理解存在根本性误区，缺乏对基本事实的认知。`,
        `你的观点经不起任何逻辑推敲，这种想法只会让人对你的判断力产生质疑。`,
        `换个角度看，类似的论点早已被事实和数据驳倒过无数次，坚持这种错误只会令人尴尬。`
      ];
    }
    
  } catch (error) {
    console.error('API error:', error);
    throw new Error('生成回复失败，请稍后再试');
  }
}; 