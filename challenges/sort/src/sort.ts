#!/usr/bin/env node

/**
 * Sort Tool - Unix sort command implementation
 *
 * This tool sorts lines of text files lexicographically.
 * It supports multiple sorting algorithms and various options.
 *
 * Usage:
 *   ccwc-sort [options] [file]
 *
 * Options:
 *   -u, --unique              Remove duplicate lines (keep first occurrence)
 *   -r, --reverse             Reverse the result of comparisons
 *   -n, --numeric-sort        Sort numerically instead of lexicographically
 *   -R, --random-sort         Sort by random hash values
 *   -a, --algorithm <name>    Choose sorting algorithm (merge|quick|heap|radix)
 *   -h, --help                Display this help message
 *   -v, --verbose             Show verbose output with statistics
 *
 * Examples:
 *   ccwc-sort file.txt                    # Sort file.txt
 *   ccwc-sort -u file.txt                 # Sort and remove duplicates
 *   ccwc-sort -r file.txt                 # Sort in reverse order
 *   ccwc-sort -n numbers.txt              # Sort numbers numerically
 *   ccwc-sort -a quick file.txt           # Use quicksort algorithm
 *   cat file.txt | ccwc-sort              # Sort from stdin
 *   ccwc-sort -v -a heap large.txt        # Verbose output with heap sort
 *
 * Challenge: https://codingchallenges.fyi/challenges/challenge-sort
 */

import { getSortFunction, randomSort, type SortAlgorithm } from './algorithms.js';
import { readLines, removeDuplicates, writeLines, formatFileSize, getFileStats } from './utils.js';

interface SortOptions {
  unique: boolean;
  reverse: boolean;
  numeric: boolean;
  random: boolean;
  algorithm: SortAlgorithm;
  verbose: boolean;
  help: boolean;
}

/**
 * Parse command line arguments
 */
function parseArguments(args: string[]): { options: SortOptions; filePath: string | null } {
  const options: SortOptions = {
    unique: false,
    reverse: false,
    numeric: false,
    random: false,
    algorithm: 'merge',
    verbose: false,
    help: false
  };

  let filePath: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-u':
      case '--unique':
        options.unique = true;
        break;
      case '-r':
      case '--reverse':
        options.reverse = true;
        break;
      case '-n':
      case '--numeric-sort':
        options.numeric = true;
        break;
      case '-R':
      case '--random-sort':
        options.random = true;
        break;
      case '-a':
      case '--algorithm':
        i++;
        if (i < args.length) {
          const algo = args[i] as SortAlgorithm;
          if (['merge', 'quick', 'heap', 'radix'].includes(algo)) {
            options.algorithm = algo;
          } else {
            console.error(`Invalid algorithm: ${algo}`);
            console.error('Valid algorithms: merge, quick, heap, radix');
            process.exit(1);
          }
        } else {
          console.error('--algorithm requires an argument');
          process.exit(1);
        }
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          filePath = arg;
        } else {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return { options, filePath };
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
Sort Tool - Unix sort command implementation

Usage:
  ccwc-sort [options] [file]

Options:
  -u, --unique              Remove duplicate lines (keep first occurrence)
  -r, --reverse             Reverse the result of comparisons
  -n, --numeric-sort        Sort numerically instead of lexicographically
  -R, --random-sort         Sort by random hash values
  -a, --algorithm <name>    Choose sorting algorithm (merge|quick|heap|radix)
  -h, --help                Display this help message
  -v, --verbose             Show verbose output with statistics

Algorithms:
  merge     - Merge sort (default): Stable, O(n log n), good for large files
  quick     - Quick sort: Fast average case, O(n log n) average
  heap      - Heap sort: O(n log n) guaranteed, in-place sorting
  radix     - Radix sort: O(d*n), efficient for strings

Examples:
  ccwc-sort file.txt                    # Sort file.txt
  ccwc-sort -u file.txt                 # Sort and remove duplicates
  ccwc-sort -r file.txt                 # Sort in reverse order
  ccwc-sort -n numbers.txt              # Sort numbers numerically
  ccwc-sort -a quick file.txt           # Use quicksort algorithm
  cat file.txt | ccwc-sort              # Sort from stdin
  ccwc-sort -v -a heap large.txt        # Verbose output with heap sort

Challenge: https://codingchallenges.fyi/challenges/challenge-sort
  `);
}

/**
 * Sort lines based on options
 */
function sortLines(lines: string[], options: SortOptions): string[] {
  let result = [...lines];

  // Remove duplicates before sorting if requested
  if (options.unique) {
    result = removeDuplicates(result);
  }

  // Choose sorting method
  if (options.random) {
    result = randomSort(result);
  } else if (options.numeric) {
    // Numeric sort
    result.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (isNaN(numA) && isNaN(numB)) return 0;
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      return numA - numB;
    });
  } else {
    // Lexicographic sort using selected algorithm
    const sortFn = getSortFunction(options.algorithm);
    result = sortFn(result);
  }

  // Reverse if requested
  if (options.reverse) {
    result.reverse();
  }

  return result;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { options, filePath } = parseArguments(args);

  // Show help if requested
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  try {
    // Verbose mode: show input file info
    if (options.verbose && filePath) {
      const stats = getFileStats(filePath);
      console.error(`Input: ${filePath}`);
      console.error(`Size: ${formatFileSize(stats.size)}`);
      console.error(`Lines: ${stats.lines}`);
      console.error(`Algorithm: ${options.algorithm}`);
      console.error('---');
    }

    // Record start time for performance measurement
    const startTime = Date.now();

    // Read input
    const lines = await readLines(filePath);

    if (options.verbose) {
      console.error(`Read ${lines.length} lines in ${Date.now() - startTime}ms`);
    }

    // Sort lines
    const sortStartTime = Date.now();
    const sorted = sortLines(lines, options);

    if (options.verbose) {
      console.error(`Sorted in ${Date.now() - sortStartTime}ms`);
      console.error(`Output: ${sorted.length} lines`);
      console.error('---');
    }

    // Write output
    writeLines(sorted);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

// Run main function
main();
