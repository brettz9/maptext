
export const empty = (el) => {
  while (el.firstChild) {
    el.firstChild.remove();
  }
};

export const timeout = (delay) => {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay || 0);
  });
};
