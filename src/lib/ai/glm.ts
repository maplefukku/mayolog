import OpenAI from 'openai'

const GLM_API_KEY = process.env.GLM_API_KEY ?? ''
const GLM_BASE_URL = process.env.GLM_BASE_URL ?? 'https://api.z.ai/api/coding/paas/v4/'
const GLM_MODEL = process.env.GLM_MODEL ?? 'glm-4.7'

export const glmClient = new OpenAI({
  apiKey: GLM_API_KEY,
  baseURL: GLM_BASE_URL,
})

export { GLM_MODEL }
