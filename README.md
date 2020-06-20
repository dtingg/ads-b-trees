# B-Trees

Ada Developers Academy / Lovelace Learning Labs

Advanced Data Structures 1 - Trees

Week 6

## Instructions

Download

```sh
$ git clone <paste-url>
$ cd <created-directory>
```

Install

```sh
$ npm install
```

Run tests in watch mode

```sh
$ npm test
```

## Assignment - Week 6

### Core

1. Read through the existing code in `src/data_structures/b_tree.js` and ensure you understand how it works
1. Implement the following functions:
    - `BTree._findIndex()`
    - `BTree.lookup()`
    - `BTree._splitChild()`
    - `BTree.insert()`
    - `BTree.forEach()`

### Optional

1. Adjust your implementation to take two parameters: the minimum degree of a non-leaf node, and the minimum degree of a leaf node, as discussed in class
1. Implement a visualization or performance testing for your B-Tree
1. Reimplement B-Tree in your favorite statically typed programming language so that it automatically chooses the size of a node
1. Read about B* Trees and B+ Trees, two common variations on B-Trees. Pick one and implement it.