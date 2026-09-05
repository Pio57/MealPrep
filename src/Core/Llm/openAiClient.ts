import { OPENAI_API_KEY } from '@env';

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

/**
 * Thin fetch wrapper around the Chat Completions API — no `openai` SDK,
 * since its Node-oriented internals don't play well with the RN/Hermes
 * runtime. `jsonSchema` is passed through as `response_format` so the
 * response body is guaranteed-valid JSON for the given schema.
 */
export async function requestStructuredCompletion<T>(
  messages: ChatMessage[],
  jsonSchema: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: 'json_schema', json_schema: jsonSchema },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
  }

  const body = await response.json();
  const content = body.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('OpenAI response did not contain message content');
  }

  return JSON.parse(content) as T;
}
