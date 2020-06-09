import BTree from "../b_tree";

describe(BTree, () => {
  const minDegree = 3;
  let btree;
  beforeEach(() => {
    btree = new BTree(minDegree);
  });

  const fillNode = ({ keyCount, isLeaf, keyPrefix = '', childKeyCount = minDegree }) => {
    const node = {
      keys: [],
      values: [],
      isLeaf: isLeaf,
    }

    if (!isLeaf) {
      node.children = [
        fillNode({
          keyCount: childKeyCount,
          isLeaf: true,
          keyPrefix: `${keyPrefix}_key_0`
        })
      ];
    }

    for (let i = 1; i <= keyCount; i += 1) {
      node.keys.push(`${keyPrefix}_key_${i}`);
      node.values.push(`${keyPrefix}_value_${i}`);

      if (!isLeaf) {
        node.children.push(
          fillNode({
            keyCount: childKeyCount,
            isLeaf: true,
            keyPrefix: `${keyPrefix}_key_${i}`
          })
        );
      }
    }
    return node;
  }

  describe('splitChild', () => {
    describe('error handling', () => {
      it('throws when trying to split a child of a full parent', () => {
        const node = fillNode({ keyCount: minDegree * 2 - 1, isLeaf: false });
        const child = fillNode({ keyCount: minDegree * 2 - 1, isLeaf: true });
        node.children[2] = child;

        expect(() => {
          btree._splitChild(node, 2);
        }).toThrow();
      });

      it('throws when trying to split a non-full child', () => {
        const node = fillNode({ keyCount: minDegree, isLeaf: false });
        const child = fillNode({ keyCount: minDegree, isLeaf: true });
        node.children[2] = child;

        expect(() => {
          btree._splitChild(node, 2);
        }).toThrow();
      });

      it('throws if parent is a leaf', () => {
        const node = fillNode({ keyCount: minDegree, isLeaf: true });
        expect(() => {
          btree._splitChild(node, 2);
        }).toThrow();
      });

      it('throws if child d.n.e.', () => {
        const node = fillNode({ keyCount: minDegree, isLeaf: false });
        expect(() => {
          btree._splitChild(node, minDegree + 2);
        }).toThrow();
      });
    });

    it('moves the child\'s middle k/v to the parent', () => {
      const node = fillNode({ keyCount: minDegree, isLeaf: false });
      const child = fillNode({ keyCount: minDegree * 2 - 1, isLeaf: true, keyPrefix: 'child' });

      const childIndex = 2;
      node.children[childIndex] = child;

      const middleIndex = Math.floor(child.keys.length / 2)
      const middleKey = child.keys[middleIndex];
      const middleVal = child.values[middleIndex];

      const beforeChildrenCount = node.children.length;
      const beforeKeysCount = node.keys.length;
      const beforeValsCount = node.values.length;
      const beforeSibling = node.children[childIndex + 1];

      btree._splitChild(node, childIndex);

      expect(node.children.length).toBe(beforeChildrenCount + 1);
      expect(node.keys.length).toBe(beforeKeysCount + 1);
      expect(node.values.length).toBe(beforeValsCount + 1);

      expect(node.keys[childIndex + 1]).toBe(middleKey);
      expect(node.values[childIndex + 1]).toBe(middleVal);

      expect(child.keys).not.toContain(middleKey);
      expect(child.values).not.toContain(middleVal);

      const sibling = node.children[childIndex + 1];
      expect(sibling).not.toBe(beforeSibling);
      expect(sibling.keys).not.toContain(middleKey);
      expect(sibling.values).not.toContain(middleVal);
    });

    it('moves the second half of the child\'s k/vs to the sibling', () => {
      const node = fillNode({ keyCount: minDegree, isLeaf: false });
      const child = fillNode({ keyCount: minDegree * 2 - 1, isLeaf: true, keyPrefix: 'child' });

      const childIndex = 2;
      node.children[childIndex] = child;

      const middleIndex = Math.floor(child.keys.length / 2)
      const leftKeys = child.keys.slice(0, middleIndex);
      const rightKeys = child.keys.slice(middleIndex + 1);
      const leftVals = child.values.slice(0, middleIndex);
      const rightVals = child.values.slice(middleIndex + 1);

      btree._splitChild(node, childIndex);

      expect(child.keys).toStrictEqual(leftKeys);
      expect(child.values).toStrictEqual(leftVals);

      const sibling = node.children[childIndex + 1];
      expect(sibling.keys).toStrictEqual(rightKeys);
      expect(sibling.values).toStrictEqual(rightVals);
    });

    it('moves the second half of the grandchildren to the sibling, if the child is an internal node', () => {
      const node = fillNode({ keyCount: minDegree, isLeaf: false });
      const child = fillNode({ keyCount: minDegree * 2 - 1, isLeaf: false, keyPrefix: 'child' });

      const childIndex = 2;
      node.children[childIndex] = child;

      const middleIndex = child.children.length / 2;
      const leftGrandchildren = child.children.slice(0, middleIndex);
      const rightGrandchildren = child.children.slice(middleIndex);

      btree._splitChild(node, childIndex);

      expect(child.children).toStrictEqual(leftGrandchildren);

      const sibling = node.children[childIndex + 1];
      expect(sibling.children).toStrictEqual(rightGrandchildren);
    });
  });
});