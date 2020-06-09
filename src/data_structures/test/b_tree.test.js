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

    
  });
});