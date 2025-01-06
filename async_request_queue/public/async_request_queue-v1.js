export default class AsyncRequestQueue {
  #queue = [];
  #executionQueue = [];
  #maxSimultaneousItems = 3;
  #currentItemsRunning = 0;
  #processCompleteHandler = null;
  #processPromise = null;
  #isProcessing = false;

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

  async process() {
    return new Promise( async (resolve, reject) => {
      resolve( new Promise( async (resolve, reject) => {
        console.log(this.#currentItemsRunning);
        if(this.#queue.length > 0 && this.#currentItemsRunning < this.#maxSimultaneousItems) {
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
      })
    );
  });
  }

  async startProcessing() {
    return this.process();
  }

  enqueue(newItem) {
    this.#queue.push(newItem);
    if(this.#isProcessing) {
      this.process();
    }
  }

  setMaxSimultaneousItems(newMax = 3) {
    this.#maxSimultaneousItems = newMax;
    if(this.#isProcessing) {
      this.process();
    }
  }
}
