import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessageEntry } from './models/chat-message-entry.model';
import { ChatSessionSummary } from './models/chat-session-summary.model';
import { MarkdownPipe } from './pipes/markdown.pipe';
import { ChatApiService } from './services/chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, MarkdownPipe, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  private readonly chatApi = inject(ChatApiService);

  protected readonly sessions = signal<ChatSessionSummary[]>([]);
  protected readonly activeSessionId = signal<string | undefined>(undefined);
  protected readonly messages = signal<ChatMessageEntry[]>([]);
  protected readonly question = signal('');
  protected readonly sending = signal(false);
  protected readonly loadingSession = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loadSessions();
  }

  protected startNewChat(): void {
    this.activeSessionId.set(undefined);
    this.messages.set([]);
    this.errorMessage.set(null);
  }

  protected openSession(sessionId: string): void {
    if (sessionId === this.activeSessionId() || this.loadingSession()) {
      return;
    }

    this.loadingSession.set(true);
    this.errorMessage.set(null);

    this.chatApi.getSession(sessionId).subscribe({
      next: (detail) => {
        this.activeSessionId.set(detail.id);
        this.messages.set(detail.messages);
        this.loadingSession.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load that conversation.');
        this.loadingSession.set(false);
      },
    });
  }

  protected send(): void {
    const question = this.question().trim();
    if (!question || this.sending()) {
      return;
    }

    this.messages.update((entries) => [
      ...entries,
      { role: 'user', content: question, timestamp: new Date().toISOString() },
    ]);
    this.question.set('');
    this.sending.set(true);
    this.errorMessage.set(null);

    const isNewConversation = this.activeSessionId() === undefined;

    this.chatApi.ask({ sessionId: this.activeSessionId(), question }).subscribe({
      next: (response) => {
        this.activeSessionId.set(response.sessionId);
        this.messages.update((entries) => [
          ...entries,
          { role: 'assistant', content: response.answer, timestamp: new Date().toISOString() },
        ]);
        this.sending.set(false);

        // A brand-new conversation just got its first entry — refresh the list so it shows up
        // without waiting for the user to do anything else. Continuing an existing one doesn't
        // need this: its identity and position don't change from the list's point of view.
        if (isNewConversation) {
          this.loadSessions();
        }
      },
      error: () => {
        this.errorMessage.set('Something went wrong. Please try again.');
        this.sending.set(false);
      },
    });
  }

  protected deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation();

    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    this.chatApi.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions.update((entries) => entries.filter((s) => s.id !== sessionId));

        if (sessionId === this.activeSessionId()) {
          this.startNewChat();
        }
      },
      error: () => this.errorMessage.set('Could not delete that conversation.'),
    });
  }

  private loadSessions(): void {
    this.chatApi.listSessions().subscribe({
      next: (sessions) => this.sessions.set(sessions),
      error: () => undefined, // the history list is a convenience — fail silently, not fatal
    });
  }
}
