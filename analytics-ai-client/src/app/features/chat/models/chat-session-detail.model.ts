import { ChatMessageEntry } from './chat-message-entry.model';

export interface ChatSessionDetail {
  id: string;
  messages: ChatMessageEntry[];
}
