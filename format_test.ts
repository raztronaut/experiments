const content = "";
const words = 0;

const obj1 = {
  readingMinutes: Math.max(1, Math.ceil((content.match(/\S+/g)?.length ?? 0) / 200)),
};

const obj2 = {
  readingMinutes: Math.max(1, Math.ceil(words / 200))
};
