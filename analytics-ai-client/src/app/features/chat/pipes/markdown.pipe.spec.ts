import { TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
  });

  it('renders **bold** as <strong>', () => {
    const html = pipe.transform('You have **9,855 orders** in total.');
    expect(html).toContain('<strong>9,855 orders</strong>');
  });

  it('renders a bullet list as <ul><li>', () => {
    const html = pipe.transform('- Requisition Lists\n- Work Orders');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Requisition Lists</li>');
  });

  it('strips a script tag instead of rendering it', () => {
    const html = pipe.transform('<script>alert(1)</script>text');
    expect(html).not.toContain('<script>');
  });
});
