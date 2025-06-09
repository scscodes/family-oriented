import { generateNumberQuestions } from '../gameUtils';
import {
  generateLetterQuestions,
  generateShapeQuestions,
  generateColorQuestions,
  generatePatternQuestions,
  generateMathQuestions,
  generateMixedQuestions,
  generateFillInTheBlankQuestions,
  generateRhymingQuestions
} from '../gameUtils';

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

describe('generateLetterQuestions', () => {
  it('creates questions with correct case and unique options', () => {
    const questions = generateLetterQuestions(5, 4);
    expect(questions).toHaveLength(5);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(4);
      expect(['letters']).toContain(q.type);
    });
  });
});

describe('generateShapeQuestions', () => {
  it('creates questions with valid shapes and unique options', () => {
    const questions = generateShapeQuestions(4, 3);
    expect(questions).toHaveLength(4);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(3);
      expect(['shapes']).toContain(q.type);
    });
  });
});

describe('generateColorQuestions', () => {
  it('creates questions with valid colors and unique options', () => {
    const questions = generateColorQuestions(4, 3);
    expect(questions).toHaveLength(4);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(3);
      expect(['colors']).toContain(q.type);
    });
  });
});

describe('generatePatternQuestions', () => {
  it('creates pattern questions with correct answer in options', () => {
    const questions = generatePatternQuestions(3, 3);
    expect(questions).toHaveLength(3);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(q.options.length).toBeLessThanOrEqual(3);
      expect(['patterns']).toContain(q.type);
    });
  });
});

describe('generateMathQuestions', () => {
  it('creates math questions with correct answer in options', () => {
    const questions = generateMathQuestions(3, 3);
    expect(questions).toHaveLength(3);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(3);
      expect(['math']).toContain(q.type);
    });
  });
});

describe('generateMixedQuestions', () => {
  it('creates a mixed set of questions', () => {
    const questions = generateMixedQuestions(6, 1, 10, 3);
    expect(questions).toHaveLength(6);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(3);
      expect([
        'numbers',
        'letters',
        'shapes',
        'colors',
        'patterns',
        'math'
      ]).toContain(q.type);
    });
  });
});

describe('generateFillInTheBlankQuestions', () => {
  it('creates fill-in-the-blank questions with correct answer in options', () => {
    const questions = generateFillInTheBlankQuestions(3, 3);
    expect(questions).toHaveLength(3);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBe(3);
      expect(q.prompt).toMatch(/completes the word/);
      expect(['fill-in-the-blank']).toContain(q.type);
    });
  });
});

describe('generateRhymingQuestions', () => {
  it('creates rhyming questions with correct answer in options', () => {
    const questions = generateRhymingQuestions(3);
    expect(questions).toHaveLength(3);
    questions.forEach(q => {
      expect(q.options).toContain(q.correctAnswer);
      expect(['rhyming']).toContain(q.type);
    });
  });
});
