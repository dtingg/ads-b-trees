import BTree from "../b_tree";
import seedrandom from 'seedrandom';
import shuffle from 'shuffle-array';

describe(BTree, () => {
  let btree;
  beforeEach(() => {
    btree = new BTree();
  });

  it('starts empty', () => {
    expect(btree.count()).toBe(0);
  });

  describe('lookup', () => {
    it('returns undefined on an empty tree', () => {
      expect(btree.lookup('test')).toBe(undefined);
    });

    it('returns undefined if the key is not in the tree', () => {
      const keys = ['many', 'keys', 'for', 'this', 'tree'];
      keys.forEach((key, i) => {
        btree.insert(key);
      });

      expect(btree.lookup('dne')).toBe(undefined);
    });

    it('finds the only record', () => {
      btree.insert('test');
      expect(btree.lookup('test')).toBeTruthy();
    });

    it('finds any extant record', () => {
      const keys = ['many', 'keys', 'for', 'this', 'tree'];
      keys.forEach(key => {
        btree.insert(key);
      });

      keys.forEach(key => {
        expect(btree.lookup(key)).toBeTruthy();
      });

      keys.reverse().forEach(key => {
        expect(btree.lookup(key)).toBeTruthy();
      });
    });

    it('returns the value associated with a record', () => {
      const records = [
        { key: 'one', value: 'first' },
        { key: 'two', value: 'second' },
        { key: 'three', value: 'third' },
        { key: 'four', value: 'fourth' },
        { key: 'five', value: 'fifth' },
      ];

      records.forEach(({ key, value }) => {
        btree.insert(key, value);
      });

      records.forEach(({ key, value }) => {
        expect(btree.lookup(key)).toBe(value);
      });

      records.reverse().forEach(({ key, value }) => {
        expect(btree.lookup(key)).toBe(value);
      });
    });
  });

  describe('splitChild', () => {
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

      expect(node.keys[childIndex]).toBe(middleKey);
      expect(node.values[childIndex]).toBe(middleVal);

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
      expect(sibling.isLeaf).toBeFalsy();
      expect(sibling.children).toStrictEqual(rightGrandchildren);
    });

    it('marks sibling as leaf if child was leaf', () => {
      const node = fillNode({ keyCount: minDegree, isLeaf: false });
      const child = fillNode({ keyCount: minDegree * 2 - 1, isLeaf: true, keyPrefix: 'child' });

      const childIndex = 2;
      node.children[childIndex] = child;

      btree._splitChild(node, childIndex);

      const sibling = node.children[childIndex + 1];
      expect(sibling.isLeaf).toBeTruthy();
    })
  });

  describe('insert', () => {
    it('increases count by 1', () => {
      expect(btree.count()).toBe(0);
      btree.insert('test');
      expect(btree.count()).toBe(1);

      const keys = ['many', 'keys', 'for', 'this', 'tree'];
      keys.forEach((key, i) => {
        btree.insert(key);
        expect(btree.count()).toBe(2 + i);
      });
    });

    it('replaces records with the same key and does not increase the count', () => {
      btree.insert('test', 'first value');
      expect(btree.count()).toBe(1);
      expect(btree.lookup('test')).toBe('first value');

      btree.insert('test', 'second value');
      expect(btree.count()).toBe(1);
      expect(btree.lookup('test')).toBe('second value');
    });

    it('uses true as the default value', () => {
      btree.insert('test');
      expect(btree.lookup('test')).toBe(true);
    });
  });

  describe('forEach', () => {
    let records;
    beforeEach(() => {
      records = [
        { key: 'one', value: 'first' },
        { key: 'two', value: 'second' },
        { key: 'three', value: 'third' },
        { key: 'four', value: 'fourth' },
        { key: 'five', value: 'fifth' },
      ];
    });

    const sortRecords = (records) => {
      return records.sort((a, b) => a.key.localeCompare(b.key));
    }

    const fill = (records) => {
      records.forEach(({ key, value }) => {
        btree.insert(key, value);
      });
    }

    it('runs the callback 0 times on an empty tree', () => {
      const cb = jest.fn();
      btree.forEach(cb);

      expect(cb.mock.calls.length).toBe(0);
    });

    it('provides {key, value}, index and tree as cb args', () => {
      btree.insert('key', 'value');

      const cb = jest.fn();
      btree.forEach(cb);

      const callArgs = cb.mock.calls[0];
      expect(callArgs[0].key).toBe('key');
      expect(callArgs[0].value).toBe('value');
      expect(callArgs[1]).toBe(0);
      expect(callArgs[2]).toBe(btree);
    });

    it('iterates records in key order', () => {
      fill(records);

      const cb = jest.fn();
      btree.forEach(cb);

      sortRecords(records).forEach(({ key, value }, i) => {
        const callArgs = cb.mock.calls[i];
        expect(callArgs[0].key).toBe(key);
        expect(callArgs[0].value).toBe(value);
        expect(callArgs[1]).toBe(i);
        expect(callArgs[2]).toBe(btree);
      });
    });

    it('iterates correctly for sorted input', () => {
      fill(sortRecords(records));

      const cb = jest.fn();
      btree.forEach(cb);

      sortRecords(records).forEach(({ key, value }, i) => {
        const callArgs = cb.mock.calls[i];
        expect(callArgs[0].key).toBe(key);
        expect(callArgs[0].value).toBe(value);
        expect(callArgs[1]).toBe(i);
        expect(callArgs[2]).toBe(btree);
      });
    });

    it('iterates correctly for reverse-sorted input', () => {
      fill(sortRecords(records).reverse());

      const cb = jest.fn();
      btree.forEach(cb);

      sortRecords(records).forEach(({ key, value }, i) => {
        const callArgs = cb.mock.calls[i];
        expect(callArgs[0].key).toBe(key);
        expect(callArgs[0].value).toBe(value);
        expect(callArgs[1]).toBe(i);
        expect(callArgs[2]).toBe(btree);
      });
    });
  });

  // XXX
  // These tests take a while - 25s on my MacBook pro
  // You may want to skip them during your initial developement,
  // or reduce maxKeyLength
  describe('large dictionaries', () => {
    const maxKeyLength = 3;

    const verifyBtreeStructure = (ds) => {
      const visit = (node, lastKey = '') => {
        // console.log('visiting node with keys', node.keys);
        for (let k = 0; k < node.keys.length; k += 1) {
          if (!node.isLeaf) {
            lastKey = visit(node.children[k], lastKey);
          }

          expect(node.keys[k].localeCompare(lastKey)).toBe(1);
          lastKey = node.keys[k];

        }
        if (!node.isLeaf) {
          lastKey = visit(node.children[node.keys.length], lastKey);
        }
        return lastKey;
      }
      visit(ds._root)
    }

    const fillAndVerify = (ds, keys) => {
      keys.forEach(key => ds.insert(key, `value_${key}`));

      expect(ds.count()).toBe(keys.length);
      verifyBtreeStructure(ds);

      const cb = jest.fn();
      btree.forEach(cb);

      keys = keys.sort();

      keys.forEach((key, i) => {
        expect(ds.lookup(key)).toBe(`value_${key}`);

        const callArgs = cb.mock.calls[i]
        expect(callArgs[0].key).toBe(key);
        expect(callArgs[0].value).toBe(`value_${key}`);
      });
    }

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    for (let keyLength = 1; keyLength <= maxKeyLength; keyLength += 1) {
      const recordCount = Math.pow(letters.length, keyLength);
      const minDegree = 2 * keyLength;

      describe(`key length ${keyLength} (${recordCount} records), minDegree ${minDegree}`, () => {
        let keys;
        beforeEach(() => {
          let tuples = [''];

          for (let i = 1; i <= keyLength; i += 1) {
            const newTuples = [];
            tuples.forEach(tup => {
              letters.forEach(letter => {
                newTuples.push(tup + letter);
              });
            });
            tuples = newTuples;
          }

          keys = tuples;
          expect(keys.length).toBe(recordCount);

          btree = new BTree(minDegree);
        });

        it('builds, looks up and iterates with sorted input', () => {
          fillAndVerify(btree, keys);
        });

        it('builds, looks up and iterates with reverse-sorted input', () => {
          fillAndVerify(btree, keys.reverse());
        });

        it('builds, looks up and iterates with suffled input 1', () => {
          fillAndVerify(btree, shuffle(keys, { rng: seedrandom('ada') }));
        });

        it('builds, looks up and iterates with suffled input 2', () => {
          fillAndVerify(btree, shuffle(keys, { rng: seedrandom('developers') }));
        });

        it('builds, looks up and iterates with suffled input 3', () => {
          fillAndVerify(btree, shuffle(keys, { rng: seedrandom('academy') }));
        });
      });
    }
  });
});