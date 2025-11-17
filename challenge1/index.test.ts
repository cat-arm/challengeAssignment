/**
 * Challenge 1: Matrix Turtle Problem - Jest Tests
 * Tests for all three problems: zigzag, clockwise, and findRoute
 */

import { problem1_1_zigzag, problem1_2_clockwise, problem1_3_findRoute } from "./index";

describe("Challenge 1: Matrix Turtle Problem", () => {
  describe("Problem 1.1: Zig-zag walking from (0,0)", () => {
    test("should handle 2x2 matrix", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const result = problem1_1_zigzag(matrix);
      // Column 0 (even): top to bottom -> 1, 3
      // Column 1 (odd): bottom to top -> 4, 2
      expect(result).toBe("1,3,4,2");
    });

    test("should handle 3x3 matrix", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const result = problem1_1_zigzag(matrix);
      // Column 0: 1, 4, 7
      // Column 1: 8, 5, 2
      // Column 2: 3, 6, 9
      expect(result).toBe("1,4,7,8,5,2,3,6,9");
    });

    test("should handle single row matrix", () => {
      const matrix = [[1, 2, 3, 4]];
      const result = problem1_1_zigzag(matrix);
      expect(result).toBe("1,2,3,4");
    });

    test("should handle single column matrix", () => {
      const matrix = [[1], [2], [3]];
      const result = problem1_1_zigzag(matrix);
      expect(result).toBe("1,2,3");
    });

    test("should handle actual input1-1.txt data", () => {
      const matrix = [
        [7, 2, 0, 1, 0, 2, 9],
        [8, 4, 8, 6, 9, 3, 3],
        [7, 8, 8, 8, 9, 0, 6],
        [4, 7, 2, 7, 0, 0, 7],
        [6, 5, 7, 8, 0, 7, 2],
        [8, 1, 8, 5, 4, 5, 2],
      ];
      const result = problem1_1_zigzag(matrix);
      // Expected output from actual execution
      const expected = "7,8,7,4,6,8,1,5,7,8,4,2,0,8,8,2,7,8,5,8,7,8,6,1,0,9,9,0,0,4,5,7,0,0,3,2,9,3,6,7,2,2";
      expect(result).toBe(expected);
    });
  });

  describe("Problem 1.2: Clockwise walking to center from (X,Y)", () => {
    test("should handle 3x3 matrix starting at (1,1)", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const start = [1, 1];
      const result = problem1_2_clockwise(matrix, start);
      // Starting at (1,1) = 5, walk clockwise
      expect(result).toContain("5");
    });

    test("should handle 2x2 matrix starting at (0,0)", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const start = [0, 0];
      const result = problem1_2_clockwise(matrix, start);
      // Starting at (0,0) = 1
      expect(result.split(",").length).toBe(4);
      expect(result).toContain("1");
    });

    test("should throw error for invalid start coordinate", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      expect(() => problem1_2_clockwise(matrix, [-1, 0])).toThrow("Invalid start coordinate");
      expect(() => problem1_2_clockwise(matrix, [0, -1])).toThrow("Invalid start coordinate");
      expect(() => problem1_2_clockwise(matrix, [10, 0])).toThrow("Invalid start coordinate");
    });

    test("should handle actual input1-2.txt data", () => {
      const matrix = [
        [7, 2, 0, 1, 0, 2, 9],
        [8, 4, 8, 6, 9, 3, 3],
        [7, 8, 8, 8, 9, 0, 6],
        [4, 7, 2, 7, 0, 0, 7],
        [6, 5, 7, 8, 0, 7, 2],
        [8, 1, 8, 5, 4, 5, 2],
      ];
      const start = [1, 1];
      const result = problem1_2_clockwise(matrix, start);
      // Expected output from actual execution
      const expected = "4,8,6,9,3,3,6,7,2,2,5,4,5,8,1,8,6,4,7,8,8,8,9,0,0,7,0,8,7,5,7,2,7,0";
      expect(result).toBe(expected);
    });

    test("should handle actual input1-2.txt data", () => {
      const matrix = [
        [7, 2, 0, 1, 0, 2, 9],
        [8, 4, 8, 6, 9, 3, 3],
        [7, 8, 8, 8, 9, 0, 6],
        [4, 7, 2, 7, 0, 0, 7],
        [6, 5, 7, 8, 0, 7, 2],
        [8, 1, 8, 5, 4, 5, 2],
      ];
      const start = [2, 3];
      const result = problem1_2_clockwise(matrix, start);
      // Expected output from actual execution
      const expected = "8,9,0,6,7,2,2,5,4,5,8,1,8,6,4,7,2,7,0,0,7,0,8,7,5";
      expect(result).toBe(expected);
    });
  });

  describe("Problem 1.3: Find target number with shortest/longest routes", () => {
    test("should find route from 2 to 8", () => {
      const matrix = [
        [7, 2, 0, 1, 0, 2, 9],
        [8, 4, 8, 6, 9, 3, 3],
        [7, 8, 8, 8, 9, 0, 6],
        [4, 7, 2, 7, 0, 0, 7],
        [6, 5, 7, 8, 0, 7, 2],
        [8, 1, 8, 5, 4, 5, 2],
      ];
      const result = problem1_3_findRoute(matrix, 2, 8);
      // Must contain the actual shortest route: "N 2,8 SHORTEST"
      expect(result).toContain("N 2,8 SHORTEST");
      // Must contain the actual longest route: "W 2,5,4,5,8,1,8 LONGEST"
      expect(result).toContain("W 2,5,4,5,8,1,8 LONGEST");
    });

    test("should return NO ROUTE when no valid path exists", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const result = problem1_3_findRoute(matrix, 1, 99);
      expect(result).toBe("NO ROUTE");
    });

    test("should handle simple 2x3 matrix", () => {
      const matrix = [
        [1, 3, 2],
        [2, 5, 6],
      ];
      const result = problem1_3_findRoute(matrix, 1, 2);
      expect(result).toContain("E 1,3,2 LONGEST");
      expect(result).toContain("S 1,2 SHORTEST");
    });

    test("should filter out paths with 0 in the middle", () => {
      const matrix = [
        [2, 0, 8],
        [8, 1, 1],
      ];
      const result = problem1_3_findRoute(matrix, 2, 8);
      // Path 2,0,8 should be invalid (0 in middle)
      // Should find other valid paths or return NO ROUTE
      expect(result).toContain("S 2,8 SHORTEST");
      expect(result).toContain("S 2,8 LONGEST");
    });
  });
});

