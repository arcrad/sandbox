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
        await this.process();
        resolve(retVal);
      } catch(error) {
        this.#currentItemsRunning--;
        await this.process();
        reject(error); 
      } 
    });
  }

  process() {
    return new Promise( (resolve, reject) => {
      resolve( new Promise( async (resolve, reject) => {
        if(
          this.#queue.length > 0 
          && this.#currentItemsRunning < this.#maxSimultaneousItems
        ) {
          let nextItem = this.#queue.shift();
          if(nextItem) { 
            this.#currentItemsRunning++;
            this.#executionQueue.push(this.#runItem(nextItem));
            await this.process();
          }
        }
        if(this.#queue.length === 0 ) {
          resolve(this.#executionQueue);
        }
      }));
    });
  }

  startProcessing() {
    return this.process();
  }

  enqueue(newItem) {
    this.#queue.push(newItem);
  }

  setMaxSimultaneousItems(newMax = 3) {
    this.#maxSimultaneousItems = newMax;
  }
}
