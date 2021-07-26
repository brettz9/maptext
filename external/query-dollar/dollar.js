const $ = (sel) => {
  return document.querySelector(sel);
};

const $$ = (sel) => {
  return document.querySelectorAll(sel);
};

export {$, $$};
