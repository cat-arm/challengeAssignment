# Challenge 1: Walking Matrix Turtle Problem

## Problems

### Problem 1.1

Given a starting point at coordinate (0,0) - have the turtle walking in zig-zag direction starting from S and then N until a turtle passes all cells.

**Input:** `input1-1.txt`
**Expected Output:**

```
7,8,7,4,6,8,1,5,7,8,4,2,0,8,8,2,7,8,5,8,7,8,6,1,4,0,0,9,9,0,5,7,0,0,3,2,9,3,6,7,2,2
```

### Problem 1.2

Given a starting point at coordinate (X,Y) - have the turtle walking to the center of the matrix in clockwise direction.

**Input:** `input1-2.txt`
**Expected Output:**

```
4,8,6,9,3,3,6,7,2,2,5,4,5,8,1,8,6,4,7,8,8,8,9,0,0,7,0,8,7,5,7,2,7,0
```

### Problem 1.3

Given that a turtle can travel in direction of only N E S W in each trip and the starting value - have the turtle find the target number without changing direction using the shortest and longest route. If the route can't be found, please display "NO ROUTE".

**Input:** `input1-3.txt` (starting value: 2, target: 8)
**Expected Output:**

```
N 2,8 SHORTEST
S 2,4,8
S 2,7,8
W 2,5,4,5,8,1,8 LONGEST
```

## Setup and Running

### Installation

```bash
npm install
```

### Running Solution

```bash
npm start
```

## Implementation

Implement the following functions in `index.ts`:

1. `problem1_1_zigzag(matrix: number[][]): string`
2. `problem1_2_clockwise(matrix: number[][], startX: number, startY: number): string`
3. `problem1_3_findRoute(matrix: number[][], startValue: number, targetValue: number): string`

## Notes

- Handle any expected and unexpected errors
- Demonstrate OOP skills in your code
- Input files are stored as text files of not more than two lines
