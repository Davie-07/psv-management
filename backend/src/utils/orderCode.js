const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
const randomDigit = () => Math.floor(Math.random() * 10);

export const generateOrderCode = () => {
  return `${randomLetter()}${randomLetter()}${randomLetter()} ${randomDigit()}${randomDigit()}${randomLetter()} ${randomLetter()}${randomDigit()}`;
};


