// This is just an interface - it will never be implemented directly
// Still, it's a convenient place to keep documentation

class OrderedDictionary {
  constructor() {
    throw new Error("Can't instantiate an interface!");
  }

  /**
   * Add a key-value pair to this dictionary. Adding a record with a
   * duplicate key replaces the previous record.
   * 
   * @param {comparable} key The lookup key for this record. Keys must be comparable to each other.
   * @param {any} value Opaque data stored for this record 
   */
  insert(key, value) {
  }

  /**
   * Search for a record by key and return the associated value.
   * 
   * @param {comparable} key Search for a record with this key
   * @returns The value associated with this key, or undefined if not found
   */
  lookup(key) {
  }

  /**
   * Search for a record by key and remove it from the dictionary.
   * 
   * @param {comparable} key Search for a record with this key
   * @returns The value associated with this key, or undefined if not found
   */
  delete(key) {
  }

  /**
   * How many records are in the dictionary?
   * 
   * @returns {integer} Record count
   */
  count() {
  }

  /**
   * @callback DictionaryCallback
   * @param {Object} record An object containing key and value properties pointing at the data for the current record
   * @param {number} index The index of this element
   * @param {OrderedDictionary} dictionary This dictionary
   */

  /**
   * Execute the callback on every key-value pair in the dictionary,
   * in key-order.
   * 
   * @param {DictionaryCallback} callback Function to run on each record
   */
  forEach(callback) {
  }
}