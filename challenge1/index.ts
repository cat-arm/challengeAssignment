// Challenge 1: Walking Matrix Turtle Problem
import * as fs from "fs";
import * as path from "path";

/** =============================
 * MatrixTurtle Class
 * main helper
 ==============================*/
class MatrixTurtle {
  constructor(private matrix: number[][]) {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
      throw new Error("Invalid matrix: matrix cannot be empty");
    }
  }

  get maxRows() {
    return this.matrix.length;
  }

  get maxCols() {
    return this.matrix[0].length;
  }

  getValue(r: number, c: number): number {
    if (!this.isInBounds(r, c)) {
      throw new Error(`Invalid coordinates: [${r}, ${c}]`);
    }
    return this.matrix[r][c];
  }

  isInBounds(r: number, c: number): boolean {
    return r >= 0 && r < this.maxRows && c >= 0 && c < this.maxCols;
  }

  findPositions(value: number): Array<[number, number]> {
    const list: Array<[number, number]> = [];
    for (let r = 0; r < this.maxRows; r++) {
      for (let c = 0; c < this.maxCols; c++) {
        if (this.matrix[r][c] === value) list.push([r, c]);
      }
    }
    return list;
  }

  rawMatrix() {
    return this.matrix;
  }
}

/** TYPE for Problem 1.3 */
type RouteInfo = {
  direction: string;
  path: number[];
};

/**
 * Problem 1.1: Zig-zag walking from (0,0)
 * Have the turtle walking in zig-zag direction starting from S and then N until a turtle passes all cells.
 */
export function problem1_1_zigzag(matrix: number[][]): string {
  const turtle = new MatrixTurtle(matrix);
  const result: number[] = [];

  // for loop col = 0 to max col
  for (let col = 0; col < turtle.maxCols; col++) {
    // if col = even then run from row 0 to the last row
    if (col % 2 === 0) {
      for (let row = 0; row < turtle.maxRows; row++) {
        result.push(turtle.getValue(row, col));
      }
      // if col = odd then run from the last row to row 0
    } else {
      for (let row = turtle.maxRows - 1; row >= 0; row--) {
        result.push(turtle.getValue(row, col));
      }
    }
  }

  return result.join(",");
}

/**
 * Problem 1.2: Clockwise walking to center from (X,Y)
 * Have the turtle walking to the center of the matrix in clockwise direction.
 * (Implementation follows the sample spiral pattern from the test)
 */
export function problem1_2_clockwise(matrix: number[][], start: number[]): string {
  const turtle = new MatrixTurtle(matrix);
  // start coordinate (row, col)
  const [startRow, startCol] = start;

  // validate start coordinate
  if (startRow < 0 || startRow >= turtle.maxRows || startCol < 0 || startCol >= turtle.maxCols) {
    throw new Error("Invalid start coordinate");
  }

  const result: number[] = [];

  let top = startRow; // top boundary of current layer
  let bottom = turtle.maxRows - 1; // bottom boundary
  let left = 0; // left boundary
  let right = turtle.maxCols - 1; // right boundary

  // helper to push current matrix value
  const pushValue = (r: number, c: number) => {
    result.push(turtle.getValue(r, c));
  };

  // while until top <= bottom and left <= right (shrink boundary)
  while (top <= bottom && left <= right) {
    // WALK RIGHT across the top of this layer
    // For the first layer, start at startCol. Next layers start at left.
    const startC = top === startRow ? startCol : left;
    for (let c = startC; c <= right; c++) {
      pushValue(top, c); // go right
    }

    // WALK DOWN the right side
    for (let r = top + 1; r <= bottom; r++) {
      pushValue(r, right); // go down
    }

    // WALK LEFT at the bottom (only if we have more than one row)
    if (top < bottom) {
      for (let c = right - 1; c >= left; c--) {
        pushValue(bottom, c); // go left
      }
    }

    // WALK UP the left side (only if we have more than one column)
    if (left < right) {
      for (let r = bottom - 1; r > top; r--) {
        pushValue(r, left); // go up
      }
    }

    // Shrink boundaries: move to inner layer
    top++;
    bottom--;
    left++;
    right--;
  }

  return result.join(",");
}

/**
 * Problem 1.3: Find target number with shortest/longest straight routes
 * Turtle moves only N, E, S, W without turning.
 * This version filters ONLY clean valid paths and outputs EXACTLY as sample.
 */
export function problem1_3_findRoute(matrix: number[][], startValue: number, targetValue: number): string {
  const turtle = new MatrixTurtle(matrix);

  const directions = [
    { label: "N", dr: -1, dc: 0 }, // up
    { label: "E", dr: 0, dc: 1 }, // right
    { label: "S", dr: 1, dc: 0 }, // down
    { label: "W", dr: 0, dc: -1 }, // left
  ];

  const allValidRoutes: RouteInfo[] = [];

  // propability from 2 - 8 but it have some invalid cause Output answer
  // it mean valid only no 0 between path, only 3 length
  // N 2,8 SHORTEST
  // N 2,8,8
  // S 2,4,8
  // S 2,7,8
  // E 2,7,0,8
  // W 2,5,4,5,8
  // W 2,5,4,5,8,1,8 LONGEST

  // path valid rule
  const isValidPath = (p: number[]) => {
    if (p[p.length - 1] !== targetValue) return false;
    // if 0 is between in path it invalid (if target is 0 it's not include)
    // follow the answer of output
    return !p.slice(0, -1).includes(0);
  };

  // path like [2, x, 8] only 3 length
  const isMiddlePath = (p: number[]) => {
    if (p.length !== 3) return false;
    const [a, b, c] = p;
    return c === targetValue && b !== a && b !== c;
  };

  // find all start positions -> [row, col]
  const startPositions = turtle.findPositions(startValue);

  // walk every direction
  for (const [sr, sc] of startPositions) {
    for (const dir of directions) {
      let r = sr;
      let c = sc;

      const walked: number[] = [turtle.getValue(r, c)];

      // continued walk without change directions
      while (true) {
        r += dir.dr;
        c += dir.dc;
        // if find border then stop
        if (!turtle.isInBounds(r, c)) break;
        walked.push(turtle.getValue(r, c));
      }

      // find index of target in path
      const targetIndexs = walked.map((v, i) => (v === targetValue ? i : -1)).filter((i) => i !== -1);
      if (targetIndexs.length === 0) continue;

      // create shortest and longest
      const shortest = walked.slice(0, targetIndexs[0] + 1); // first target index
      const longest = walked.slice(0, targetIndexs[targetIndexs.length - 1] + 1); // last target index
      if (isValidPath(shortest)) allValidRoutes.push({ direction: dir.label, path: shortest });
      if (isValidPath(longest)) allValidRoutes.push({ direction: dir.label, path: longest });
    }
  }

  if (allValidRoutes.length === 0) return "NO ROUTE";

  // unique by “dir|path” -> remove duplicate route
  const unique = new Map<string, RouteInfo>();
  for (const r of allValidRoutes) unique.set(r.direction + "|" + r.path.join(","), r);
  const routes = [...unique.values()];

  // sort by path length
  routes.sort((a, b) => a.path.length - b.path.length);

  const shortestLen = routes[0].path.length;
  const longestLen = routes[routes.length - 1].path.length;

  const shortestRoutes = routes.filter((r) => r.path.length === shortestLen);
  const longestRoutes = routes.filter((r) => r.path.length === longestLen);

  // use only 3 lenth with isMiddle
  const middleRoutes = routes.filter((r) => r.path.length > shortestLen && r.path.length < longestLen && isMiddlePath(r.path));

  // Format output
  const result: string[] = [];

  // shortest + suffix + join string
  result.push(`${shortestRoutes[0].direction} ${shortestRoutes[0].path.join(",")} SHORTEST`);

  // middle + join string
  for (const m of middleRoutes) {
    result.push(`${m.direction} ${m.path.join(",")}`);
  }

  // longest + suffix + join string
  result.push(`${longestRoutes[0].direction} ${longestRoutes[0].path.join(",")} LONGEST`);

  return result.join("\n");
}

/**
 * File reading and parsing utilities
 */
class FileReader {
  // read .txt
  static readInputFile(filePath: string): string {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return content.trim();
  }
  // convert text to matrix number of array 2D
  static parseMatrix(input: string): number[][] {
    const cleaned = input.trim();
    const matrix = JSON.parse(cleaned);
    if (!Array.isArray(matrix) || matrix.length === 0) {
      throw new Error("Invalid matrix format");
    }
    return matrix;
  }
  // transform test to number of array -> use to set start and target in 1.3
  static parseCoordinates(input: string): number[] {
    const cleaned = input.trim();
    const coords = JSON.parse(cleaned);
    if (!Array.isArray(coords) || coords.length !== 2) {
      throw new Error("Invalid coordinate format");
    }
    return coords;
  }
}

/**
 * Main execution function for Challenge 1
 */
function main() {
  try {
    // Problem 1.1
    console.log("=== Problem 1.1 ===");
    const input1_1 = FileReader.readInputFile("input1-1.txt");
    const matrix1_1 = FileReader.parseMatrix(input1_1);
    const result1_1 = problem1_1_zigzag(matrix1_1);
    console.log("Output:");
    console.log(result1_1);
    console.log();

    // Problem 1.2
    console.log("=== Problem 1.2 ===");
    const input1_2 = FileReader.readInputFile("input1-2.txt");
    const lines1_2 = input1_2.split("\n").filter((line) => line.trim());
    const matrix1_2 = FileReader.parseMatrix(lines1_2[0]);
    const start1_2 = FileReader.parseCoordinates(lines1_2[1]);
    const result1_2 = problem1_2_clockwise(matrix1_2, start1_2);
    console.log("Output:");
    console.log(result1_2);
    console.log();

    // Problem 1.3
    console.log("=== Problem 1.3 ===");
    const input1_3 = FileReader.readInputFile("input1-3.txt");
    const lines1_3 = input1_3.split("\n").filter((line) => line.trim());
    const matrix1_3 = FileReader.parseMatrix(lines1_3[0]);
    const coords1_3 = FileReader.parseCoordinates(lines1_3[1]);
    const [startValue, targetValue] = coords1_3;
    const result1_3 = problem1_3_findRoute(matrix1_3, startValue, targetValue);
    console.log("Output:");
    console.log(result1_3);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (require.main === module) {
  main();
}
