
export const empty = (el) => {
  while (el.firstChild) {
    el.firstChild.remove();
  }
};
