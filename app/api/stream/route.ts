import { NextRequest } from 'next/server';
import { streamResponses } from '@/app/utils/api';

// 添加GET方法支持EventSource连接
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const opponentWords = searchParams.get('opponentWords');
    const intensityStr = searchParams.get('intensity');
    
    if (!opponentWords) {
      return new Response(
        JSON.stringify({ error: '请提供对方的话' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const intensity = intensityStr ? parseInt(intensityStr, 10) : 5;
    
    if (isNaN(intensity) || intensity < 1 || intensity > 10) {
      return new Response(
        JSON.stringify({ error: '语气强度必须是1-10之间的数字' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建一个转换流来处理SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 启动流式生成，并将更新写入流
    streamResponses(
      opponentWords, 
      intensity,
      async (responses) => {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ responses })}\n\n`)
        );
      }
    )
    .then(async () => {
      // 发送完成信号
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
      );
      await writer.close();
    })
    .catch(async (error) => {
      console.error('Streaming error:', error);
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ 
          error: error.message || '生成回复失败，请稍后再试',
          done: true
        })}\n\n`)
      );
      await writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || '生成回复失败，请稍后再试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { opponentWords, intensity } = await request.json();

    if (!opponentWords || typeof opponentWords !== 'string') {
      return new Response(
        JSON.stringify({ error: '请提供对方的话' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (intensity === undefined || typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
      return new Response(
        JSON.stringify({ error: '语气强度必须是1-10之间的数字' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建一个转换流来处理SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 启动流式生成，并将更新写入流
    streamResponses(
      opponentWords, 
      intensity,
      async (responses) => {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ responses })}\n\n`)
        );
      }
    )
    .then(async () => {
      // 发送完成信号
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
      );
      await writer.close();
    })
    .catch(async (error) => {
      console.error('Streaming error:', error);
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ 
          error: error.message || '生成回复失败，请稍后再试',
          done: true
        })}\n\n`)
      );
      await writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || '生成回复失败，请稍后再试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 