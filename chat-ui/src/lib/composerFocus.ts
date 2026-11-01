/** Lets shortcuts and buttons anywhere focus (and optionally fill) the composer. */
type Handle = { focus: () => void; setText: (text: string) => void };

let handle: Handle | null = null;

export const registerComposer = (h: Handle | null) => {
  handle = h;
};

export const focusComposer = () => handle?.focus();

export const fillComposer = (text: string) => {
  handle?.setText(text);
  handle?.focus();
};
