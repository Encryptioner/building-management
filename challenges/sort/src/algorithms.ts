/**
 * Sorting Algorithms Module
 *
 * This module contains various sorting algorithm implementations.
 * Each algorithm has different performance characteristics:
 *
 * - Merge Sort: Stable, O(n log n) time, O(n) space, good for large datasets
 * - Quick Sort: Fast average case O(n log n), O(log n) space, but O(n²) worst case
 * - Heap Sort: O(n log n) guaranteed, O(1) space, not stable
 * - Radix Sort: O(d*n) where d is max digits/chars, good for strings
 */

export type SortAlgorithm = 'merge' | 'quick' | 'heap' | 'radix';

/**
 * Merge Sort Implementation
 * Stable sorting algorithm with guaranteed O(n log n) time complexity
 *
 * How it works:
 * 1. Divide array into two halves
 * 2. Recursively sort each half
 * 3. Merge the sorted halves back together
 */
export function mergeSort(lines: string[]): string[] {
  if (lines.length <= 1) {
    return lines;
  }

  const mid = Math.floor(lines.length / 2);
  const left = mergeSort(lines.slice(0, mid));
  const right = mergeSort(lines.slice(mid));

  return merge(left, right);
}

function merge(left: string[], right: string[]): string[] {
  const result: string[] = [];
  let i = 0;
  let j = 0;

  // Compare elements from left and right arrays
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // Add remaining elements
  return result.concat(left.slice(i)).concat(right.slice(j));
}

/**
 * Quick Sort Implementation
 * Fast in practice with O(n log n) average case
 *
 * How it works:
 * 1. Choose a pivot element
 * 2. Partition array so elements < pivot are on left, > pivot on right
 * 3. Recursively sort left and right partitions
 */
export function quickSort(lines: string[]): string[] {
  if (lines.length <= 1) {
    return lines;
  }

  const pivot = lines[Math.floor(lines.length / 2)];
  const left = lines.filter(line => line < pivot);
  const middle = lines.filter(line => line === pivot);
  const right = lines.filter(line => line > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

/**
 * Heap Sort Implementation
 * Guaranteed O(n log n) with O(1) space complexity
 *
 * How it works:
 * 1. Build a max heap from the array
 * 2. Repeatedly extract the maximum element
 * 3. Rebuild heap and repeat
 */
export function heapSort(lines: string[]): string[] {
  const arr = [...lines]; // Create a copy
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    [arr[0], arr[i]] = [arr[i], arr[0]];

    // Heapify the reduced heap
    heapify(arr, i, 0);
  }

  return arr;
}

function heapify(arr: string[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

/**
 * Radix Sort Implementation (LSD - Least Significant Digit)
 * Efficient for sorting strings, O(d*n) where d is max string length
 *
 * How it works:
 * 1. Sort by least significant character
 * 2. Move to next character position
 * 3. Repeat until all characters processed
 * 4. Use counting sort for each character position (stable)
 */
export function radixSort(lines: string[]): string[] {
  if (lines.length <= 1) {
    return lines;
  }

  // Find the maximum length
  const maxLen = Math.max(...lines.map(line => line.length));

  let arr = [...lines];

  // Sort from least significant to most significant character
  for (let pos = maxLen - 1; pos >= 0; pos--) {
    arr = countingSortByChar(arr, pos);
  }

  return arr;
}

function countingSortByChar(arr: string[], pos: number): string[] {
  const output: string[] = new Array(arr.length);
  const count: number[] = new Array(256).fill(0); // ASCII characters

  // Count occurrences of each character
  for (const str of arr) {
    const charCode = pos < str.length ? str.charCodeAt(pos) : 0;
    count[charCode]++;
  }

  // Calculate cumulative count
  for (let i = 1; i < 256; i++) {
    count[i] += count[i - 1];
  }

  // Build output array (iterate backwards for stability)
  for (let i = arr.length - 1; i >= 0; i--) {
    const charCode = pos < arr[i].length ? arr[i].charCodeAt(pos) : 0;
    output[count[charCode] - 1] = arr[i];
    count[charCode]--;
  }

  return output;
}

/**
 * Random Sort Implementation
 * Sorts by random hash values for shuffling effect
 *
 * How it works:
 * 1. Create hash value for each line
 * 2. Sort by hash values
 * 3. Result appears random but is deterministic based on input
 */
export function randomSort(lines: string[]): string[] {
  // Create array of [line, hash] pairs
  const withHashes = lines.map(line => ({
    line,
    hash: simpleHash(line)
  }));

  // Sort by hash
  withHashes.sort((a, b) => a.hash - b.hash);

  // Return just the lines
  return withHashes.map(item => item.line);
}

/**
 * Simple hash function for random sorting
 * Uses string characters to generate a pseudo-random number
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get the appropriate sorting function based on algorithm name
 */
export function getSortFunction(algorithm: SortAlgorithm): (lines: string[]) => string[] {
  switch (algorithm) {
    case 'merge':
      return mergeSort;
    case 'quick':
      return quickSort;
    case 'heap':
      return heapSort;
    case 'radix':
      return radixSort;
    default:
      return mergeSort; // Default to merge sort
  }
}
