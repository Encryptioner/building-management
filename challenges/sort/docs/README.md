# 🔢 Sort Tool - Unix Sort Command Implementation

A feature-rich implementation of the Unix `sort` command, supporting multiple sorting algorithms and educational insights into sorting techniques.

## 📚 Challenge

This project implements the [Coding Challenges - Sort](https://codingchallenges.fyi/challenges/challenge-sort) challenge by John Crickett.

**Goal**: Build a command-line tool that sorts lines in text files, supporting various options and algorithms.

## ✨ Features

- ✅ **Lexicographic Sorting** - Sort lines alphabetically (default)
- ✅ **Numeric Sorting** - Sort lines as numbers with `-n` flag
- ✅ **Unique Lines** - Remove duplicates with `-u` flag
- ✅ **Reverse Order** - Sort in descending order with `-r` flag
- ✅ **Random Sorting** - Shuffle lines deterministically with `-R` flag
- ✅ **Multiple Algorithms** - Choose from merge, quick, heap, or radix sort
- ✅ **Stdin Support** - Read from files or standard input
- ✅ **Verbose Mode** - Show performance statistics and file info
- 📖 **Educational** - Well-commented code with algorithm explanations

## 🚀 Quick Start

### Installation

```bash
cd challenges/sort
pnpm install
pnpm build
```

### Basic Usage

```bash
# Sort a file
pnpm dev -- example.txt

# Or use the built version
node dist/sort.js example.txt

# Sort and remove duplicates
pnpm dev -- -u names.txt

# Sort in reverse order
pnpm dev -- -r words.txt

# Sort numbers numerically
pnpm dev -- -n numbers.txt

# Use quick sort algorithm
pnpm dev -- -a quick large-file.txt

# Pipe from stdin
cat file.txt | pnpm dev

# Verbose mode with statistics
pnpm dev -- -v -a heap data.txt
```

## 📖 Command Line Options

| Option | Description |
|--------|-------------|
| `-u, --unique` | Remove duplicate lines (keeps first occurrence) |
| `-r, --reverse` | Reverse the sort order |
| `-n, --numeric-sort` | Sort numbers numerically instead of as strings |
| `-R, --random-sort` | Sort by random hash values (deterministic) |
| `-a, --algorithm <name>` | Choose sorting algorithm: `merge`, `quick`, `heap`, `radix` |
| `-v, --verbose` | Show performance statistics and file information |
| `-h, --help` | Display help message |

## 🧮 Sorting Algorithms

### 1. Merge Sort (Default)
- **Time Complexity**: O(n log n) - guaranteed
- **Space Complexity**: O(n)
- **Stability**: Stable (preserves order of equal elements)
- **Best For**: Large datasets, when stability matters

**How it works**: Divide array in half, recursively sort each half, then merge.

### 2. Quick Sort
- **Time Complexity**: O(n log n) average, O(n²) worst case
- **Space Complexity**: O(log n)
- **Stability**: Not stable
- **Best For**: General purpose, fast average performance

**How it works**: Pick a pivot, partition around it, recursively sort partitions.

### 3. Heap Sort
- **Time Complexity**: O(n log n) - guaranteed
- **Space Complexity**: O(1)
- **Stability**: Not stable
- **Best For**: When memory is limited, guaranteed performance

**How it works**: Build a max heap, repeatedly extract the maximum element.

### 4. Radix Sort
- **Time Complexity**: O(d × n) where d is max string length
- **Space Complexity**: O(n)
- **Stability**: Stable
- **Best For**: Sorting strings, when n is large and d is small

**How it works**: Sort by each character position, from least to most significant.

## 📊 Performance Examples

```bash
# Compare algorithm performance on large files
pnpm dev -- -v -a merge large.txt
pnpm dev -- -v -a quick large.txt
pnpm dev -- -v -a heap large.txt
pnpm dev -- -v -a radix large.txt
```

Example output:
```
Input: large.txt
Size: 50.23 MB
Lines: 1000000
Algorithm: merge
---
Read 1000000 lines in 234ms
Sorted in 1567ms
Output: 1000000 lines
---
```

## 🎯 Challenge Steps

This implementation covers all steps from the Coding Challenges:

### ✅ Step 1: Basic Sorting
Sort lines lexicographically (alphabetically).

```bash
pnpm dev -- file.txt
```

### ✅ Step 2: Unique Flag
Remove duplicate lines with `-u` option.

```bash
pnpm dev -- -u file.txt
```

### ✅ Step 3: Multiple Algorithms
Support for multiple sorting algorithms that the user can choose.

```bash
pnpm dev -- -a quick file.txt
pnpm dev -- -a heap file.txt
pnpm dev -- -a radix file.txt
```

### ✅ Step 4: Random Sort
Deterministic random sorting using hash-based ordering.

```bash
pnpm dev -- -R file.txt
```

## 📝 Examples

### Example 1: Sort Names
```bash
# Input: names.txt
Bob
Alice
Charlie
Alice
David

# Command:
pnpm dev -- -u names.txt

# Output:
Alice
Bob
Charlie
David
```

### Example 2: Sort Numbers
```bash
# Input: numbers.txt
100
20
3
1000

# Without -n (lexicographic):
pnpm dev -- numbers.txt
# Output: 100, 1000, 20, 3

# With -n (numeric):
pnpm dev -- -n numbers.txt
# Output: 3, 20, 100, 1000
```

### Example 3: Reverse Sort
```bash
# Input: fruits.txt
Apple
Banana
Cherry

# Command:
pnpm dev -- -r fruits.txt

# Output:
Cherry
Banana
Apple
```

## 🏗️ Project Structure

```
challenges/sort/
├── src/
│   ├── sort.ts          # Main CLI entry point
│   ├── algorithms.ts    # Sorting algorithm implementations
│   └── utils.ts         # File I/O and helper functions
├── docs/
│   ├── README.md        # This file
│   └── LEARNING.md      # In-depth learning guide
├── tests/
│   └── test-data/       # Test files
├── package.json
└── tsconfig.json
```

## 🔬 Algorithm Deep Dive

For a detailed explanation of how each sorting algorithm works with visualizations and complexity analysis, see [LEARNING.md](./LEARNING.md).

## 🧪 Testing

Create test files to verify the implementation:

```bash
# Create test data
echo -e "zebra\napple\nbanana\napple" > tests/test-data/simple.txt

# Test basic sort
pnpm dev -- tests/test-data/simple.txt

# Test with unique flag
pnpm dev -- -u tests/test-data/simple.txt

# Create numeric test data
echo -e "100\n20\n3\n1000" > tests/test-data/numbers.txt

# Test numeric sort
pnpm dev -- -n tests/test-data/numbers.txt
```

## 🎓 Learning Resources

- [Sorting Algorithms Visualization](https://visualgo.net/en/sorting)
- [Unix Sort Command Manual](https://man7.org/linux/man-pages/man1/sort.1.html)
- [Algorithm Complexity Cheat Sheet](https://www.bigocheatsheet.com/)

## 🤝 Contributing

This is an educational project. Feel free to:
- Add more sorting algorithms
- Improve performance optimizations
- Add more command-line options
- Enhance documentation

## 📄 License

MIT License - See main repository for details

## 👤 Author

**Ankur Mursalin**
- [Website](https://encryptioner.github.io/)
- [LinkedIn](https://www.linkedin.com/in/mir-mursalin-ankur)
- [GitHub](https://github.com/Encryptioner)

---

**Challenge Source**: [Coding Challenges - Sort](https://codingchallenges.fyi/challenges/challenge-sort) by John Crickett
