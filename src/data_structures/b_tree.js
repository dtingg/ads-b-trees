class BTreeNode {
  constructor(isLeaf) {
    this.keys = [];
    this.values = [];
    this.isLeaf = isLeaf;
    if (!isLeaf) {
      this.children = [];
    }
  }
}

class BTree {
  constructor(minDegree = 2, Node = BTreeNode) {
    // degree is number of children
    // size is number of keys
    this.minDegree = minDegree;
    this.maxDegree = 2 * minDegree;

    this.Node = Node;
    this._root = new this.Node(true);

    this._count = 0;
  }

  _splitChild(parent, childIndex) {
    // Assumption: parent is not full, child is full
    if (parent.keys.length >= this.maxDegree - 1) {
      throw new Error("Attempting to split child of a full parent");
    } else if (parent.isLeaf) {
      throw new Error("Parent is a leaf");
    }

    const child = parent.children[childIndex];
    if (!child) {
      throw new Error("Child does not exist");
    } else if (child.keys.length < this.maxDegree - 1) {
      throw new Error("Attempting to split a child that isn't full");
    }

    /**
     * Imagine:
     * minDegree is 3, so maxDegree is 6
     * min keys for a node is 2, max is 5
     * 
     * Then parent must have at most 4 keys / 5 children
     * and child has 5 keys / 6 children
     * 
     * Key 3 and sibling will be inserted into the parent
     * 
     * Child will have keys 1, 2
     * and children 1, 2, 3
     * 
     * Sibling will have keys 4, 5
     * and children 4, 5, 6
     * 
     * See also:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
     */

     // TODO
  }

  insert(key, value = true) {
    if (this._root.children && (this._root.children.length == this.maxDegree)) {
      let newRoot = new this.Node(false);
      newRoot.children = [this._root];      
      this._splitChild(newRoot, 0);
      this._root = newRoot;
    }

    let node = this._root;

    while (true) {
      let index = this._findIndex(node, key);

      if (node.keys[index] === key) {
        node.values[index] = value;
        return;
      }

      if (node.isLeaf) {
        node.keys.splice(index, 0, key);
        node.values.splice(index, 0, value);
        this._count += 1;
        break;
      } else {
        let child = node.children[index];

        if (child.children.length == this.maxDegree) {
          this._splitChild(node, index);
          if (key > node.keys[index]) {
            child = node.children[index + 1];
          }
        }

        node = child;
      }
    }
  }

  _findIndex(node, key) {
    // If there's an exact match, return that index
    // If not, return the appropriate child index such that
    // node.keys[i-1] <= key <= node.keys[i]
    //              0 <= i   <= node.keys.length

    // TODO upgrade to binary search
    let i = 0;
    while (i < node.keys.length && node.keys[i] < key) {
      i += 1;
    }
    return i;
  }

  lookup(key) {
    let node = this._root;

    while (true) {
      let i = this._findIndex(node, key);

      if (i < node.keys.length && node.keys[i] == key) {
        return node.values[i];
      } else if (node.isLeaf) {
        return undefined
      } else {
        node = node.children[i];
      }
    }
  }

  count() {
    return this._count;
  }

  forEach(callback) {
    // TODO
  }
}

export default BTree;