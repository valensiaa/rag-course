import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Element, ElementContent } from 'hast';
import { remarkCitations, stripPartialMarker } from '../../lib/remarkCitations';
import { CitationChip } from '../citations/CitationChip';
import { CodeBlock } from './CodeBlock';

const hastText = (n: ElementContent): string =>
  n.type === 'text' ? n.value : 'children' in n ? n.children.map(hastText).join('') : '';

const components = {
  'cite-ref': (props: { 'data-cite'?: string | number }) => <CitationChip id={Number(props['data-cite'])} />,
  pre: ({ node }: { node?: Element }) => {
    const code = node?.children.find((c): c is Element => c.type === 'element' && c.tagName === 'code');
    const cls = (code?.properties.className as string[] | undefined) ?? [];
    const lang = cls.find((c) => c.startsWith('language-'))?.slice('language-'.length);
    const text = code ? code.children.map(hastText).join('').replace(/\n$/, '') : '';
    return <CodeBlock code={text} lang={lang} />;
  },
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
} as Components;

const remarkPlugins = [remarkGfm, remarkCitations];

/**
 * Markdown answer with inline citation chips.
 * Later: two-way highlighting and an "uncited sentence" marker hook in here as
 * extra remark plugins that wrap sentences, keyed off the same citation ids.
 */
export const MarkdownAnswer = memo(function MarkdownAnswer({
  text,
  streaming,
  muted,
}: {
  text: string;
  streaming: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`answer ${streaming ? 'streaming' : ''} ${muted ? 'unsourced' : ''}`}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {streaming ? stripPartialMarker(text) : text}
      </ReactMarkdown>
    </div>
  );
});
