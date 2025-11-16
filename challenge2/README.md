# Challenge 2: Squirrel Tree Problem

## Problem Description

A squirrel dug several holes to store his walnuts in a big tree. For a squirrel to jump from one branch to another, it uses the same amount of energy. Given that all branches (represented by nodes) except a root have an equal amount of given capacity J. Please help a squirrel to save his energy by trying to store walnut at the closest hole first. All walnuts are on the ground (root node) on the first start. On going up, he can only carry one walnut in each trip and he prefer to jump to the most left branch first. After reaching a hole and storing his walnut, he will always jump down to the ground (root node) to get the next walnut.

## Input Format

Serialized string: `"25,3,ABEG)H)))C)DFIK)L))JM"`

- First number: Number of walnuts (25)
- Second number: Capacity per hole (3)
- Remaining string: Tree structure in serialized format

## Expected Output

```
1AB 2AB 3AB 4AC 5AC 6AC 7AD 8AD 9AD 10ABE 11ABE 12ABE 13ADF 14ADF 15ADF 16ABEG 17ABEG 18ABEG 19ABEH 20ABEH 21ABEH 22ADFI 23ADFI 24ADFI 25ADFJ
```

## Error Cases

- If the input tree is impossible: `"IMPOSSIBLE TREE"`
- If the given walnut is 0 or not valid: `"INVALID WALNUT AMOUNT"`
- If the given capacity is 0 or not valid: `"INVALID HOLE CAPACITY"`

## Running

```bash
npm install
npm start
```

## Notes
- Input file is stored as a text file of not more than one line
- Handle any expected and unexpected errors
- Demonstrate OOP skills in your code

