import type { DocArea } from '../../types/chat';
import { AreaTag } from '../citations/SourceMeta';
import { Icon } from '../ui/Icon';

export const EXAMPLE_QUESTIONS: { question: string; area: DocArea | null }[] = [
  { question: 'How does Array.prototype.map() handle sparse arrays?', area: 'js' },
  { question: 'How do I lay out a page with grid-template-areas?', area: 'css' },
  { question: 'How do I copy text to the clipboard in JavaScript?', area: 'webapi' },
  { question: 'What’s the difference between no-cache and no-store in Cache-Control?', area: 'http' },
  { question: 'Which state management library should I use with React?', area: null },
];

export function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      <div aria-hidden="true" className="ruled pointer-events-none absolute inset-x-0 top-0 h-80 opacity-70" />
      <div className="relative mx-auto max-w-[720px] px-4 pb-10 pt-[12vh] sm:px-6">
        <p className="eyebrow rise text-accent">Web platform reference · sourced</p>
        <h1 className="rise mt-3 font-serif text-[clamp(30px,5vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em] [animation-delay:40ms]">
          Every claim, traced to the docs.
        </h1>
        <p className="rise mt-4 max-w-[54ch] text-[15.5px] text-ink-2 [animation-delay:80ms]">
          Ask about JavaScript, CSS, HTML, Web APIs or HTTP. Answers cite the MDN passages they’re built from,
          marked like this{' '}
          <span
            aria-hidden="true"
            className="mx-px inline-flex h-[1.5em] min-w-[1.5em] items-center justify-center rounded-[3px] bg-accent-soft px-[0.35em] align-[0.3em] font-mono text-[0.68em] font-semibold leading-none text-accent-ink"
          >
            1
          </span>
          , so you can check any sentence against its source.
        </p>

        <h2 className="eyebrow rise mt-10 text-muted [animation-delay:120ms]">Try asking</h2>
        <ul className="rise mt-2 divide-y divide-rule border-y border-rule [animation-delay:140ms]">
          {EXAMPLE_QUESTIONS.map(({ question, area }) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => onPick(question)}
                className="group flex w-full items-center gap-4 py-3 text-left text-[15px] text-ink-2 hover:text-ink"
              >
                <span className="w-16 shrink-0">
                  {area ? <AreaTag area={area} /> : <span className="eyebrow text-muted">Off-topic</span>}
                </span>
                <span className="flex-1">{question}</span>
                <Icon
                  name="arrowUp"
                  size={15}
                  className="shrink-0 rotate-45 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
