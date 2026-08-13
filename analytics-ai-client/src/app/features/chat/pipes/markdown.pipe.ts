import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { marked } from 'marked';

/**
 * Renders Markdown (Claude's chat responses routinely use **bold**, bullet lists, etc.) to safe
 * HTML. DomSanitizer.sanitize() returns an already-cleaned plain string (not a SafeHtml — that's
 * only what bypassSecurityTrustHtml produces), so [innerHTML] still runs its own pass over it too
 * — harmless, since sanitizing already-safe HTML is idempotent, and it means this pipe's output
 * is safe to inspect/test directly rather than an opaque wrapper.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): string {
    const html = marked.parse(value, { async: false, breaks: true });
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
