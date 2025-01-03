export default class AsyncRequestQueue {
  let #queue = [];
  let #maxSimultaneousItems = 3;
  let #currentItemsRunning = 0;
  constructor(initialItems) {
    this.#queue.push(initialItems);
  }
  
  #process() {
  }

  enqueue(newItem) {
    this.#queue.push(newItem);
  }

  startProcessing() {
  }
}
