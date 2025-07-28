import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

export { getOpenAI } 