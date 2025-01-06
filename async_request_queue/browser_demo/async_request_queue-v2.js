export default class AsyncRequestQueue {
  #queue = [];
  #executionQueue = [];
  #maxSimultaneousItems = 3;
  #currentItemsRunning = 0;

  constructor(initialItems) {
    this.#queue = [...initialItems];
  }
  
  #runItem(item) {
    return new Promise( async (resolve, reject) => {
      let retVal;
      try {
        retVal = await item();
        this.#currentItemsRunning--;
        await this.#process();
        resolve(retVal);
      } catch(error) {
        this.#currentItemsRunning--;
        await this.#process();
        reject(error); 
      } 
    });
  }

  async #process() {
    if(this.#queue.length === 0 ) {
      return;
    }
    if(this.#currentItemsRunning < this.#maxSimultaneousItems) {
      this.#executionQueue.push(this.#runItem(this.#queue.shift()));
      this.#currentItemsRunning++;
      this.#process(); 
    }
    return Promise.race(this.#executionQueue);
  }

  async startProcessing() {
    await this.#process();
    return Promise.allSettled(this.#executionQueue);
  }

  enqueue(newItem) {
    this.#queue.push(newItem);
  }

  setMaxSimultaneousItems(newMax = 3) {
    this.#maxSimultaneousItems = newMax;
  }
}
