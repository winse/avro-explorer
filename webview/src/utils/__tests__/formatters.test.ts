import { convertToCSV, formatBytes } from '../formatters';

describe('formatters', () => {
  describe('convertToCSV', () => {
    test('converts array of objects to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const csv = convertToCSV(data);

      expect(csv).toBe('name,age\nJohn,30\nJane,25');
    });

    test('handles values with commas', () => {
      const data = [{ name: 'John, Jr.', age: 30 }];

      const csv = convertToCSV(data);

      expect(csv).toBe('name,age\n"John, Jr.",30');
    });

    test('handles empty array', () => {
      const csv = convertToCSV([]);

      expect(csv).toBe('');
    });
  });

  describe('formatBytes', () => {
    test('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('handles decimal places', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(2048, 2)).toBe('2 KB');
    });
  });
});
