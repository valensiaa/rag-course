import { useState } from 'react';
import { Highlight, type PrismTheme } from 'prism-react-renderer';
import { copyToClipboard } from '../../lib/copyText';
import { Icon } from '../ui/Icon';

// Colours come from CSS variables so one theme object serves light and dark.
const theme: PrismTheme = {
  plain: { color: 'var(--code-ink)', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'var(--code-comment)', fontStyle: 'italic' } },
    { types: ['punctuation', 'operator'], style: { color: 'var(--code-punct)' } },
    { types: ['keyword', 'atrule', 'important', 'rule'], style: { color: 'var(--code-keyword)' } },
    { types: ['string', 'char', 'attr-value', 'template-string', 'url'], style: { color: 'var(--code-string)' } },
    { types: ['number', 'boolean', 'constant', 'unit'], style: { color: 'var(--code-number)' } },
    { types: ['function', 'class-name', 'selector'], style: { color: 'var(--code-func)' } },
    { types: ['property', 'attr-name', 'tag', 'builtin'], style: { color: 'var(--code-prop)' } },
  ],
};

const ALIASES: Record<string, string> = { js: 'javascript', ts: 'typescript', html: 'markup', xml: 'markup', svg: 'markup', sh: 'bash' };

/**
 * Fenced code block. Later: a "Try it" runner can wrap this component for
 * runnable js/html/css snippets without changing how markdown maps to it.
 */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const language = lang ? (ALIASES[lang] ?? lang) : 'plain';

  return (
    <div className="not-prose overflow-hidden rounded-md border border-rule bg-code-bg">
      <div className="flex items-center justify-between border-b border-rule px-3 py-1">
        <span className="eyebrow text-muted">{lang || 'text'}</span>
        <button
          type="button"
          onClick={async () => {
            if (await copyToClipboard(code)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }
          }}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 font-mono text-[11px] text-muted hover:bg-sunken hover:text-ink"
        >
          <Icon name={copied ? 'check' : 'copy'} size={13} />
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
          <span className="sr-only"> code</span>
        </button>
      </div>
      <Highlight code={code} language={language} theme={theme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="scrollbar-thin overflow-x-auto px-4 py-3 font-mono text-[13px] leading-[1.6]" tabIndex={0}>
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                  {line.length === 1 && line[0].empty ? '\n' : null}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
