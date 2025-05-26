import { NextRequest, NextResponse } from 'next/server';
import { generateResponses } from '@/app/utils/api';

export async function POST(request: NextRequest) {
  try {
    const { opponentWords, intensity } = await request.json();

    if (!opponentWords || typeof opponentWords !== 'string') {
      return NextResponse.json(
        { error: '请提供对方的话' },
        { status: 400 }
      );
    }

    if (intensity === undefined || typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
      return NextResponse.json(
        { error: '语气强度必须是1-10之间的数字' },
        { status: 400 }
      );
    }

    const responses = await generateResponses(opponentWords, intensity);
    
    return NextResponse.json({ responses });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || '生成回复失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 新增流式API路由
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const opponentWords = searchParams.get('opponentWords');
  const intensityStr = searchParams.get('intensity');
  
  if (!opponentWords) {
    return NextResponse.json(
      { error: '请提供对方的话' },
      { status: 400 }
    );
  }

  const intensity = intensityStr ? parseInt(intensityStr, 10) : 5;
  
  if (isNaN(intensity) || intensity < 1 || intensity > 10) {
    return NextResponse.json(
      { error: '语气强度必须是1-10之间的数字' },
      { status: 400 }
    );
  }

  // 使用流式响应
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // 启动流式生成
  generateResponses(opponentWords, intensity)
    .then(async (responses) => {
      // 发送完整的响应
      await writer.write(
        encoder.encode(JSON.stringify({ responses, done: true }))
      );
      await writer.close();
    })
    .catch(async (error) => {
      console.error('Streaming API error:', error);
      await writer.write(
        encoder.encode(JSON.stringify({ 
          error: error.message || '生成回复失败，请稍后再试',
          done: true 
        }))
      );
      await writer.close();
    });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 