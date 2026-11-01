/**
 * Remark plugin: turns `[n]` markers in text into `<cite-ref data-cite="n">`
 * elements that react-markdown maps to <CitationChip>. Markers inside code
 * are untouched because code nodes aren't `text` nodes.
 *
 * Later: a sibling plugin can wrap sentences in spans for two-way
 * highlighting, keyed off the same `data-cite` ids.
 */
import type { Plugin } from 'unified';
import type { Root, RootContent, Text } from 'mdast';

const MARKER = /\[(\d{1,3})\]/g;

interface CitationNode {
  type: 'citationRef';
  data: { hName: 'cite-ref'; hProperties: { dataCite: number } };
}

type Node = RootContent | CitationNode;
type Parent = { children: Node[] };

function splitText(node: Text): (Text | CitationNode)[] {
  const out: (Text | CitationNode)[] = [];
  let last = 0;
  for (const m of node.value.matchAll(MARKER)) {
    if (m.index > last) out.push({ type: 'text', value: node.value.slice(last, m.index) });
    out.push({ type: 'citationRef', data: { hName: 'cite-ref', hProperties: { dataCite: Number(m[1]) } } });
    last = m.index + m[0].length;
  }
  if (out.length === 0) return [node];
  if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
  return out;
}

function walk(parent: Parent) {
  parent.children = parent.children.flatMap((child): Node[] => {
    if (child.type === 'text') return splitText(child);
    if ('children' in child) walk(child as unknown as Parent);
    return [child];
  });
}

export const remarkCitations: Plugin<[], Root> = () => (tree) => {
  walk(tree as unknown as Parent);
};

/** While streaming, hide a marker that is still being typed, e.g. a trailing "[1". */
export const stripPartialMarker = (text: string) => text.replace(/\[\d{0,3}$/, '');
