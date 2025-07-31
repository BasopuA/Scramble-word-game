// src/utils/scramble.ts

export const scrambleName = (name: string): string => {
  const array = name.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  // Avoid returning the same name
  const scrambled = array.join('');
  return scrambled === name ? scrambleName(name) : scrambled;
};