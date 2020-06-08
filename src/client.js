import BinarySearchTree from "./data_structures/binary_search_tree";

const bst = new BinarySearchTree();

const records = [
  { key: 'one', value: 'first' },
  { key: 'two', value: 'second' },
  { key: 'three', value: 'third' },
  { key: 'four', value: 'fourth' },
  { key: 'five', value: 'fifth' },
];

records.forEach(({key, value}) => bst.insert(key, value));

console.log(`inserted ${bst.count()} records into binary search tree`);

bst.forEach((record, i) => {
  console.log(`Record ${i}: ${record.key} -> ${record.value}`);
});