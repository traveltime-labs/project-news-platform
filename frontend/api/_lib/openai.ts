/**
 * OpenAI 呼叫封裝
 */
// import OpenAI from 'openai'

// 暫時停用 OpenAI 客戶端初始化
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function translateNewsItem(
  _title: string,
  _summary: string,
): Promise<{ titleZh: string; summaryZh: string }> {
  throw new Error('OpenAI 翻譯功能已暫時停用')
}
