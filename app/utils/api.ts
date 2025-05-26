import OpenAI from 'openai';

const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'deepseek/deepseek-chat';

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
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
    const prompt = getPromptByIntensity(opponentWords, intensity);
    
    const stream = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    let fullContent = '';
    let currentResponses: string[] = [];
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        currentResponses = parseResponses(fullContent);
        onUpdate(currentResponses);
      }
    }

    // 确保最后一次更新是完整的回复
    const finalResponses = parseResponses(fullContent);
    onUpdate(finalResponses);
    
  } catch (error) {
    console.error('API error:', error);
    throw new Error('生成回复失败，请稍后再试');
  }
};

// 保留原有的非流式API以兼容旧代码
export const generateResponses = async (opponentWords: string, intensity: number): Promise<string[]> => {
  try {
    const prompt = getPromptByIntensity(opponentWords, intensity);
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content || '';
    return parseResponses(content);
    
  } catch (error) {
    console.error('API error:', error);
    throw new Error('生成回复失败，请稍后再试');
  }
}; 