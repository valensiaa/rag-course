import type { DocArea, DocStatus } from '../types/chat';

export const AREAS: Record<DocArea, { label: string; short: string }> = {
  js: { label: 'JavaScript', short: 'JS' },
  css: { label: 'CSS', short: 'CSS' },
  html: { label: 'HTML', short: 'HTML' },
  webapi: { label: 'Web APIs', short: 'Web API' },
  http: { label: 'HTTP', short: 'HTTP' },
};

export const AREA_ORDER: DocArea[] = ['js', 'css', 'html', 'webapi', 'http'];

export const STATUS_LABEL: Record<DocStatus, string> = {
  deprecated: 'Deprecated',
  experimental: 'Experimental',
  'non-standard': 'Non-standard',
};

export const STATUS_DESCRIPTION: Record<DocStatus, string> = {
  deprecated: 'No longer recommended. May be removed from browsers.',
  experimental: 'Not yet stable. Check browser compatibility before relying on it.',
  'non-standard': 'Not on a standards track. Behaviour may differ between browsers.',
};
