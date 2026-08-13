export interface ChatMessageEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
