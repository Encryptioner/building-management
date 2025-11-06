/**
 * Utility Functions for Sort Tool
 *
 * Helper functions for file I/O, deduplication, and other operations
 */

import * as fs from 'fs';
import * as readline from 'readline';
import { Readable } from 'stream';

/**
 * Read lines from a file or stdin
 *
 * @param filePath - Path to file, or null for stdin
 * @returns Promise resolving to array of lines
 */
export async function readLines(filePath: string | null): Promise<string[]> {
  const lines: string[] = [];

  // Determine input stream
  let input: Readable;
  if (filePath) {
    // Read from file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    input = fs.createReadStream(filePath);
  } else {
    // Read from stdin
    input = process.stdin;
  }

  // Use readline for line-by-line processing
  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity // Treat \r\n as single line break
  });

  // Collect all lines
  for await (const line of rl) {
    lines.push(line);
  }

  return lines;
}

/**
 * Remove duplicate lines while preserving order
 *
 * This implements the -u (unique) flag functionality.
 * Uses a Set to track seen lines efficiently.
 *
 * @param lines - Array of lines
 * @returns Array with duplicates removed
 */
export function removeDuplicates(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }

  return result;
}

/**
 * Remove consecutive duplicate lines
 *
 * Similar to Unix uniq command - only removes duplicates
 * that appear consecutively in the sorted output.
 *
 * @param lines - Array of lines (should be sorted)
 * @returns Array with consecutive duplicates removed
 */
export function removeConsecutiveDuplicates(lines: string[]): string[] {
  if (lines.length === 0) {
    return lines;
  }

  const result: string[] = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] !== lines[i - 1]) {
      result.push(lines[i]);
    }
  }

  return result;
}

/**
 * Write lines to stdout
 *
 * @param lines - Array of lines to output
 */
export function writeLines(lines: string[]): void {
  for (const line of lines) {
    console.log(line);
  }
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Get file statistics
 *
 * @param filePath - Path to file
 * @returns Object with file stats
 */
export function getFileStats(filePath: string): {
  size: number;
  lines: number;
} {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;

  return {
    size: stats.size,
    lines
  };
}
