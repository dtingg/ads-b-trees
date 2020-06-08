class BSTNode {
  constructor({ key, value, parent, left, right }) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.left = left;
    this.right = right;
  }
}


class BinarySearchTree {
  constructor(Node = BSTNode) {
    this.Node = Node;
    this._count = 0;
    this._root = undefined;
  }

  _findNode(key) {
    // Retuns {node, parent}, either of which may be undefined
    // Node undefined means the key isn't in the tree
    // Parent undefined means node is the root
    let node = this._root;
    let parent = node?.parent;

    // Nodes without keys are considered sentinels
    while (node && node.key !== undefined) {
      if (key < node.key) {
        parent = node;
        node = node.left;
      } else if (key > node.key) {
        parent = node;
        node = node.right;
      } else { // equal
        break;
      }
    }
    return { node, parent }
  }

  _insertInternal(key, value = true) {
    const results = this._findNode(key);
    let { node } = results;
    const { parent } = results;

    if (node?.key) {
      // key already in the tree, replace the value
      node.value = value;

    } else {
      // new node
      node = new this.Node({ key, value, parent });
      this._count += 1;

      if (parent?.key) {
        if (key < parent.key) {
          parent.left = node;
        } else {
          parent.right = node;
        }

      } else {
        this._root = node;
      }
    }
    return node;
  }

  insert(key, value) {
    // same as insertInternal, but doesn't return the node to preserve encapsulation
    this._insertInternal(key, value);
  }

  lookup(key) {
    // Hooray for optional chaining!
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
    return this._findNode(key).node?.value;
  }

  delete(key) {
    const { node, parent } = this._findNode(key);

    if (!node) {
      return undefined;
    }

    let replacement;

    if (node.left && node.right) {
      // Both children (complex case)
      // Find in-order successor and transpose it to node's spot
      let successor = node.right;
      
      if (successor.left) {
        // Walk all the way to the left
        while (successor.left) {
          successor = successor.left;
        }

        // Make sure its old right child is taken care of
        successor.parent.left = successor.right;
        if (successor.right) {
          successor.right.parent = successor.parent;
        }

        // Assign the new right child
        successor.right = node.right;
        node.right.parent = successor;
      }

      successor.left = node.left;
      successor.left.parent = successor;

      replacement = successor;

    } else {
      // One or no child -> acts like a linked list
      replacement = node.left ? node.left : node.right;

    }

    // fixup links to parent
    if (parent) {
      const direction = node === parent.left ? 'left' : 'right';
      parent[direction] = replacement;

    } else {
      this._root = replacement;
    }

    if (replacement) {
      replacement.parent = parent;
    }

    // fix count and return
    this._count -= 1;
    return node.value;
  }

  count() {
    return this._count;
  }

  forEach(callback) {
    const visit = (node, callback, i = 0) => {
      if (node?.key) {
        i = visit(node.left, callback, i);
        callback({ key: node.key, value: node.value }, i, this);
        i = visit(node.right, callback, i + 1);
      }
      return i;
    }
    visit(this._root, callback)
  }

  forEachIterativeStack(callback) {
    const stack = [];
    let i = 0;
    let node = this._root;
    while (node || stack.length > 0) {
      // slide to the left (all the way)
      while (node) {
        stack.push(node);
        node = node.left;
      }

      // one pop this time
      node = stack.pop();
      callback({ key: node.key, value: node.value }, i, this);
      i += 1;

      // slide to the right
      // (only one step because we'll need to hit the child's
      // left subtree and the child itself before going right again)
      node = node.right;
    }
  }

  forEachIterativeNoStack(callback) {
    let node = this._root;
    let prev = this._root?.parent;

    let i = 0;
    while (node) {
      let next;
      if (prev === node.parent && node.left) {
        // Go left
        next = node.left;

      } else if ((prev === node.parent && !node.left) || prev === node.left) {
        // visit and go right
        callback({ key: node.key, value: node.value }, i, this);
        i += 1;

        if (node.right) {
          next = node.right;
        } else {
          next = node.parent;
        }

      } else {
        // Go up
        next = node.parent;
      }
      prev = node;
      node = next;
    }
  }
}

export default BinarySearchTree;