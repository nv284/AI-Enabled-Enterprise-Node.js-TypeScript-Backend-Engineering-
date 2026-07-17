import { describe, it, expect } from 'vitest';
import { add, multiply, divide } from '../src/math';

describe('math', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('multiplies two numbers', () => {
    expect(multiply(4, 5)).toBe(20);
  });

  it('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('throws on divide-by-zero', () => {
    expect(() => divide(1, 0)).toThrow('Division by zero');
  });
});
