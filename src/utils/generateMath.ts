// src/utils/generateMath.ts

interface MathProblem {
  question: string;
  answer: number;
}

export const generateMathProblem = (stage: number): MathProblem => {
  const baseLevel = Math.min(stage, 10); // Cap at level 10 to avoid overflow
  let a: number, b: number, op: string, answer: number;

  const operations = ['+', '-', '*', '/'];

  // Increase difficulty with stage
  const max = 5 + baseLevel * 3;
  const min = 1 + Math.floor(baseLevel / 2);

  a = Math.floor(Math.random() * (max - min)) + min;
  b = Math.floor(Math.random() * (max - min)) + min;

  // Weight operations by stage
  let possibleOps = ['+', '-'];
  if (baseLevel >= 3) possibleOps.push('*');
  if (baseLevel >= 6) possibleOps.push('/');

  op = possibleOps[Math.floor(Math.random() * possibleOps.length)];

  switch (op) {
    case '+':
      answer = a + b;
      break;
    case '-':
      answer = a - b;
      break;
    case '*':
      answer = a * b;
      break;
    case '/':
      // Ensure clean division
      a = a * b; // make a divisible by b
      answer = a / b;
      break;
    default:
      answer = a + b;
  }

  return {
    question: `${a} ${op} ${b} = ?`,
    answer,
  };
};