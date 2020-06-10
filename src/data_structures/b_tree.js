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

  _insertNonfull(node, key, value) {
    if (node.keys.length >= this.maxDegree - 1) {
      throw new Error("Attempting to insert into a full node");
    }

    while (true) {
      const index = this._findIndex(node, key);

      if (node.keys[index] === key) {
        node.values[index] = value;
        return false;
      }

      if (node.isLeaf) {
        node.keys.splice(index, 0, key);
        node.values.splice(index, 0, value);
        return true;

      } else {
        let child = node.children[index];
        if (child.keys.length === this.maxDegree - 1) {
          this._splitChild(node, index);
          if (key > node.keys[index]) {
            child = node.children[index + 1];
          }
        }
        node = child;
      }
    }
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
    
    const sibling = new this.Node(child.isLeaf);
    const sibIndex = childIndex + 1;

    // Promote middle key / value from child to parent
    parent.keys.splice(childIndex, 0, child.keys[this.minDegree - 1]);
    parent.values.splice(childIndex, 0, child.values[this.minDegree - 1]);

    // Insert new sibling into the parent
    parent.children.splice(sibIndex, 0, sibling);

    // Move (minDegree - 1) keys and values to the new sibling
    // TODO: is there a clever way to do this without calling both slice and splice?
    sibling.keys = child.keys.slice(this.minDegree);
    child.keys.splice(this.minDegree - 1);

    sibling.values = child.values.slice(this.minDegree);
    child.values.splice(this.minDegree - 1);

    // Move minDegree grandchildren to the new sibling
    if (!child.isLeaf) {
      sibling.children = child.children.splice(this.minDegree);
    }
  }

  insert(key, value = true) {
    if (this._root.keys.length === this.maxDegree - 1) {
      // Root is full!
      // Create a new root, make the old root its child,
      // then split the old root
      const newRoot = new this.Node(false);
      newRoot.children[0] = this._root;

      this._splitChild(newRoot, 0);
      this._root = newRoot;
    }

    if (this._insertNonfull(this._root, key, value)) {
      this._count += 1;
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

  _findNode(key) {
    let node = this._root;

    while (node) {
      const i = this._findIndex(node, key);

      if (i < node.keys.length && node.keys[i] === key) {
        return { node, index: i }
      } else if (node.isLeaf) {
        return {};
      } else {
        node = node.children[i]
      }
    }
  }

  lookup(key) {
    const { node, index } = this._findNode(key);
    return node?.values[index];
  }

  count() {
    return this._count;
  }

  forEach(callback) {
    const visit = (node, callback, i = 0) => {
      for (let k = 0; k < node.keys.length; k += 1) {
        if (!node.isLeaf) {
          i = visit(node.children[k], callback, i);
        }
        callback({ key: node.keys[k], value: node.values[k] }, i, this);
        i += 1;
      }
      if (!node.isLeaf) {
        i = visit(node.children[node.keys.length], callback, i);
      }
      return i;
    }
    visit(this._root, callback)
  }
}

export default BTree;