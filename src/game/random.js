const MANTISSA = 2 ** 53;

export function nextIndex(count, random = Math.random) {
  if (count <= 1) return 0;
  const quota = Math.floor(MANTISSA / count);
  if (quota < 1) return 0;
  const limit = quota * count;
  let sample = Math.floor(random() * MANTISSA);
  for (let spin = 0; sample >= limit && spin < 8; spin += 1) {
    sample = Math.floor(random() * MANTISSA);
  }
  if (sample >= limit) return count - 1;
  return Math.floor(sample / quota);
}

export function shuffle(list, random = Math.random) {
  const items = [...list];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = nextIndex(index + 1, random);
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

export function sample(list, count, random = Math.random) {
  const take = Math.min(count, list.length);
  const items = [...list];
  for (let index = 0; index < take; index += 1) {
    const swap = index + nextIndex(items.length - index, random);
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items.slice(0, take);
}

export function randomId(random = Math.random) {
  let id = "";
  for (let index = 0; index < 7; index += 1) id += nextIndex(36, random).toString(36);
  return id;
}
