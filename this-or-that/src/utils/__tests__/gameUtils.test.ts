import { generateNumberQuestions } from '../gameUtils';

describe('generateNumberQuestions', () => {
  it('creates questions within range and with unique options', () => {
    const questions = generateNumberQuestions(3, 1, 5, 4);
    expect(questions).toHaveLength(3);
    questions.forEach(q => {
      const ans = parseInt(q.correctAnswer, 10);
      expect(ans).toBeGreaterThanOrEqual(1);
      expect(ans).toBeLessThanOrEqual(5);
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(4);
    });
  });
});
