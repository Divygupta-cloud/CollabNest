import { AICategory } from '../issues/model';

export interface TicketClassificationInput {
  title: string;
  description: string;
}

export interface TicketClassificationResult {
  category: AICategory;
  confidence: number;
  reason: string;
  suggestedTags: string[];
}

export interface LLMProvider {
  name: string;
  classifyTicket(input: TicketClassificationInput): Promise<TicketClassificationResult>;
}
