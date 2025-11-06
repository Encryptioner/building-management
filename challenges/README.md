# 🎯 Coding Challenges

This directory contains implementations of various coding challenges, primarily from [Coding Challenges](https://codingchallenges.fyi/) by John Crickett.

## 📚 Challenges Implemented

### 1. Sort Tool ✅

**Status**: Complete

**Location**: [`challenges/sort/`](./sort/)

**Description**: A feature-rich implementation of the Unix `sort` command with multiple sorting algorithms.

**Features**:
- Lexicographic and numeric sorting
- Unique lines (-u flag)
- Reverse order (-r flag)
- Random sorting (-R flag)
- Multiple algorithms: merge sort, quick sort, heap sort, radix sort
- Verbose mode with performance statistics
- Comprehensive documentation with learning guide

**Quick Start**:
```bash
cd challenges/sort
pnpm install
pnpm build

# Basic usage
node dist/sort.js file.txt

# With options
node dist/sort.js -u -a quick file.txt
```

**Documentation**:
- [Main README](./sort/docs/README.md) - Usage and features
- [Learning Guide](./sort/docs/LEARNING.md) - Deep dive into sorting algorithms

---

## 🎓 Learning Philosophy

Each challenge implementation follows these principles:

1. **Intuitive Documentation**: Explanations focus on "why" not just "how"
2. **Multiple Approaches**: When applicable, implement different algorithms/strategies
3. **Well-Commented Code**: Code serves as learning material
4. **Practical Examples**: Real test cases and usage scenarios
5. **Performance Insights**: Understand complexity and real-world performance

## 🚀 Getting Started

Each challenge is a self-contained project with its own:
- `package.json` - Dependencies and scripts
- `src/` - Source code
- `docs/` - Documentation
- `tests/` - Test files and data

### General Workflow

```bash
# Navigate to challenge
cd challenges/<challenge-name>

# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Run the tool
node dist/<tool-name>.js [options] [file]

# Or use dev mode (no build needed)
pnpm dev -- [options] [file]
```

## 📖 Challenge Sources

- [Coding Challenges](https://codingchallenges.fyi/) - Primary source
- [Advent of Code](https://adventofcode.com/) - Future challenges
- Custom challenges based on real-world problems

## 🤝 Contributing

Feel free to:
- Add new challenges
- Improve existing implementations
- Enhance documentation
- Add more test cases

## 📝 License

MIT License - See main repository for details

## 👤 Author

**Ankur Mursalin**
- [Website](https://encryptioner.github.io/)
- [LinkedIn](https://www.linkedin.com/in/mir-mursalin-ankur)
- [GitHub](https://github.com/Encryptioner)

---

**Happy Coding! 🎉**
