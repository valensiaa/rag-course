import { Icon } from '../ui/Icon';

export function FollowUps({ questions, onPick }: { questions: string[]; onPick: (q: string) => void }) {
  return (
    <section aria-label="Suggested follow-up questions" className="mt-5">
      <h3 className="eyebrow mb-1.5 text-muted">Follow-ups</h3>
      <ul className="divide-y divide-rule border-y border-rule">
        {questions.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              className="group flex w-full items-center justify-between gap-3 py-2 text-left text-[14px] text-ink-2 hover:text-ink"
            >
              {q}
              <Icon name="arrowUp" size={14} className="shrink-0 rotate-45 text-muted group-hover:text-ink" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
