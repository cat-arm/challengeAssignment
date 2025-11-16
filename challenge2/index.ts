import * as fs from "fs";
import * as path from "path";

/**
 * TreeNode class represents a node in the tree.
 * Each node has:
 * - name: letter A–Z (empty string "" for dummy root on the ground)
 * - children: child branches
 * - capacity: maximum walnuts this hole can store (0 = not a hole)
 * - stored: current number of walnuts stored
 */
class TreeNode {
  name: string;
  children: TreeNode[];
  capacity: number;
  stored: number;

  constructor(name: string, capacity: number) {
    this.name = name;
    this.children = [];
    this.capacity = capacity;
    this.stored = 0;
  }

  /**
   * Check if this node is a hole (can store walnuts).
   * In this problem, the trunk node (A) has capacity 0, so it is not a hole.
   */
  isHole(): boolean {
    return this.capacity > 0;
  }

  /**
   * Check if this hole is already full.
   */
  isFull(): boolean {
    return this.stored >= this.capacity;
  }

  /**
   * Store a walnut in this hole (if there is still capacity).
   */
  storeWalnut(): void {
    if (!this.isFull()) {
      this.stored++;
    }
  }
}

/**
 * TreeParser handles parsing the serialized tree string into a tree of TreeNode objects.
 *
 * Serialized format example: "ABEG)H)))C)DFIK)L))JM"
 * - Letters A–Z represent nodes.
 * - ')' means go back to parent (close current branch).
 *
 * IMPORTANT:
 * - The first letter (A) is the trunk (root of the tree) and is NOT a hole (capacity = 0).
 * - All other letters are holes, with capacity = given capacity J.
 * - We also use a dummy root with name "" to represent the ground.
 *   This dummy root is the parent of A.
 */
class TreeParser {
  /**
   * Parse serialized tree string into a tree structure.
   * @param treeString - Serialized tree string, e.g. "ABEG)H)))C)DFIK)L))JM"
   * @param capacity - Capacity per hole (J)
   * @returns Dummy root node (on the ground, name = "")
   */
  static parse(treeString: string, capacity: number): TreeNode {
    // Dummy root node (ground), not a hole
    const root = new TreeNode("", 0);
    const stack: TreeNode[] = [root];

    let i = 0;
    let isFirstLetter = true; // first letter (A) is trunk, capacity = 0

    while (i < treeString.length) {
      const char = treeString[i];

      if (char === ")") {
        // Close current branch move back to parent node
        if (stack.length > 1) {
          // remove current node and move cursor to parent
          stack.pop();
        }
        i++;
      } else if (/[A-Z]/.test(char)) {
        // Create a new node for this letter
        // First letter (trunk A) has capacity 0 (not a hole),
        // all other letters are holes with capacity = J.
        const nodeCapacity = isFirstLetter ? 0 : capacity;
        const node = new TreeNode(char, nodeCapacity);

        // find parent of new node
        const parent = stack[stack.length - 1];
        // bring new node to childrend of parent
        parent.children.push(node);
        // move cursor to new node
        stack.push(node);

        isFirstLetter = false;
        i++;
      } else {
        // Ignore invalid characters
        i++;
      }
    }

    return root;
  }
}

/**
 * Squirrel class handles the walnut storage logic.
 *
 * Rules:
 * 1. Squirrel starts at the ground (dummy root).
 * 2. It carries exactly one walnut at a time.
 * 3. It always stores in the closest available hole (minimum depth).
 * 4. If several holes are at the same depth, it chooses the leftmost one.
 * 5. After storing, it always returns to the ground for the next walnut.
 *
 * We model "closest" using Breadth-First Search (BFS) by levels:
 * - level = number of edges from the trunk,
 * - BFS ensures minimum depth and leftmost preference.
 */
class Squirrel {
  private root: TreeNode;
  private results: string[] = [];

  constructor(root: TreeNode) {
    this.root = root;
  }

  /**
   * Store all walnuts following the problem rules.
   *
   * @param totalWalnuts - total number of walnuts to store
   * @returns array of strings like ["1AB", "2AB", "3AB", ...]
   *          where "1AB" means: walnut #1 stored at path A→B.
   */
  storeWalnuts(totalWalnuts: number): string[] {
    this.results = [];

    for (let walnutNum = 1; walnutNum <= totalWalnuts; walnutNum++) {
      // For each walnut, find the closest available hole based on current filled status
      // (dummy root)   ← this.root
      //    |
      //    └── A
      //         ├── B
      //         └── C
      // [dummyRoot, A, B] // first
      const path = this.findClosestAvailableHole(this.root);

      if (path.length === 0) {
        // No free hole available anywhere in the tree
        break;
      }

      // The hole is the last node in the path
      // targetHole = B
      const targetHole = path[path.length - 1];
      // B.stored = 1 // first
      // C.stored = 0;
      targetHole.storeWalnut();

      // Build path string using node names (dummy root has name = "")
      const pathString = path.map((node) => node.name).join("");

      // Result format: "<walnut_number><path>", e.g. "1AB"
      this.results.push(`${walnutNum}${pathString}`);
    }

    return this.results;
  }

  /**
   * Find the closest available hole using Breadth-First Search (BFS).
   *
   * BFS properties:
   * - It explores by level (distance from root), so the first free hole found
   *   is always the closest.
   * - It processes children in the existing order, so leftmost child is
   *   always visited first at each level.
   *
   * @param start - starting node (dummy root)
   * @returns path from dummy root to the closest available hole,
   *          or empty array if there is no available hole.
   */
  // Breadth-First Search (BFS)
  private findClosestAvailableHole(start: TreeNode): TreeNode[] {
    type QueueItem = { node: TreeNode; path: TreeNode[] };
    // queue = [{ node: dummyRoot, path: [dummyRoot] }];
    // queue = [{ node: A, path: [dummyRoot, A] }];
    const queue: QueueItem[] = [{ node: start, path: [start] }];

    while (queue.length > 0) {
      // node = dummyRoot; // first
      // path = [dummyRoot];
      // node = A; // second
      // path = [dummyRoot, A];

      const { node, path } = queue.shift()!;

      // If this node is a hole and not full, we found the closest free hole
      if (node.isHole() && !node.isFull()) {
        return path;
      }

      // Otherwise, add children (from left to right) into the queue
      for (const child of node.children) {
        // queue = [{ node: A, path: [dummyRoot, A] }]; // first
        // queue = [
        //   { node: B, path: [dummyRoot, A, B] },
        //   { node: C, path: [dummyRoot, A, C] },
        // ]; // second
        queue.push({
          node: child,
          path: [...path, child],
        });
      }
    }

    // No free hole in the entire tree
    return [];
  }
}

/**
 * InputValidator validates the given parameters.
 */
class InputValidator {
  /**
   * Validate walnut amount.
   * Must be a positive integer.
   */
  static validateWalnutAmount(walnuts: number): void {
    if (!walnuts || walnuts <= 0 || !Number.isInteger(walnuts)) {
      throw new Error("INVALID WALNUT AMOUNT");
    }
  }

  /**
   * Validate hole capacity.
   * Must be a positive integer.
   */
  static validateHoleCapacity(capacity: number): void {
    if (!capacity || capacity <= 0 || !Number.isInteger(capacity)) {
      throw new Error("INVALID HOLE CAPACITY");
    }
  }

  /**
   * Validate tree structure string.
   * Must contain only uppercase letters and ')' characters.
   */
  static validateTree(treeString: string): void {
    if (!treeString || treeString.length === 0) {
      throw new Error("IMPOSSIBLE TREE");
    }

    const validPattern = /^[A-Z)]+$/;
    if (!validPattern.test(treeString)) {
      throw new Error("IMPOSSIBLE TREE");
    }
  }
}

/**
 * Main function to solve the Squirrel Tree Problem.
 *
 * Expected input format: "walnuts,capacity,treeString"
 * Example: "25,3,ABEG)H)))C)DFIK)L))JM"
 *
 * @param input - input line from file
 * @returns result string, e.g.
 *          "1AB 2AB 3AB 4AC 5AC 6AC ..."
 *          or an error message:
 *          "INVALID WALNUT AMOUNT" | "INVALID HOLE CAPACITY" | "IMPOSSIBLE TREE"
 */
export function solveSquirrelTree(input: string): string {
  try {
    const parts = input.split(",");
    if (parts.length < 3) {
      throw new Error("IMPOSSIBLE TREE");
    }

    const walnuts = parseInt(parts[0], 10);
    const capacity = parseInt(parts[1], 10);
    const treeString = parts.slice(2).join(","); // join in case treeString contains commas

    // Validate inputs
    InputValidator.validateWalnutAmount(walnuts);
    InputValidator.validateHoleCapacity(capacity);
    InputValidator.validateTree(treeString);

    // Build tree
    const root = TreeParser.parse(treeString, capacity);

    // Tree must have at least one child (trunk A)
    if (root.children.length === 0) {
      throw new Error("IMPOSSIBLE TREE");
    }

    // Let the squirrel store walnuts
    const squirrel = new Squirrel(root);
    const results = squirrel.storeWalnuts(walnuts);

    // If we cannot store all walnuts, tree is impossible
    if (results.length < walnuts) {
      throw new Error("IMPOSSIBLE TREE");
    }

    // Join results with spaces
    return results.join(" ");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID WALNUT AMOUNT" || error.message === "INVALID HOLE CAPACITY" || error.message === "IMPOSSIBLE TREE") {
        return error.message;
      }
    }
    // Unexpected error: rethrow for debugging
    throw error;
  }
}

/**
 * FileReader utility class for reading the input file.
 */
class FileReader {
  /**
   * Read and trim input file content.
   * @param filePath - relative path from current directory
   */
  static readInputFile(filePath: string): string {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = fs.readFileSync(fullPath, "utf-8");
      return content.trim();
    } catch (error) {
      throw new Error(`Error reading file: ${error}`);
    }
  }
}

/**
 * Main execution function (for CLI usage).
 * Reads input2.txt, passes it to solveSquirrelTree, and prints the result.
 */
function main() {
  try {
    const input = FileReader.readInputFile("input2.txt");
    const result = solveSquirrelTree(input);
    console.log(result);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run main() only when this file is executed directly with Node.
if (require.main === module) {
  main();
}
