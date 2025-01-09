export default class AsyncRequestQueue {
  #queue = [];
  #executionQueue = [];
  #maxSimultaneousItems = 3;
  #currentItemsRunning = 0;
  #processCompleteHandler = () => {};
  #processPromise = null;
  #isProcessing = false;

  constructor(initialItems) {
    if(initialItems && typeof initialItems[Symbol.iterator] === 'function') {
      this.#queue = [...initialItems];
    }
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

  #process() {
    if(this.#queue.length > 0 && this.#currentItemsRunning < this.#maxSimultaneousItems) {
      this.#runItem(
        this.#queue.shift()
      ).then( 
        (result) => { 
          this.#executionQueue.push(
            {
              'status': 'fulfilled',
              'value': result,
            }
          );
      }).catch( 
        (error) => { 
          this.#executionQueue.push(
            {
              'status': 'rejected',
              'reason': error,
            }
          );
      }).finally(
        () => {
          if(this.#queue.length === 0 && this.#currentItemsRunning == 0) {
            this.#processCompleteHandler();
            return;
          }
        }
      );
      this.#currentItemsRunning++;
      this.#process(); 
    }
  }

  startProcessing() {
    if(this.#isProcessing === true) {
      //Allow calling multiple times while processing? 
      return this.#processPromise;
      // Or reject?
      //return Promise.reject('Already processing');
    }
    if(this.#isProcessing === false && this.#queue.length === 0) {
      this.#processCompleteHandler();
      return this.#processPromise ?? Promise.resolve([]);
    }
    this.#isProcessing = true;
    this.#processPromise = new Promise( (resolve, reject) => {
      this.#processCompleteHandler = () => {
        this.#isProcessing = false;
        resolve(this.#executionQueue);
      };
      this.#process();
    });
    return this.#processPromise;
  }

  enqueue(newItem) {
    this.#queue.push(newItem);
    if(this.#isProcessing) {
      this.#process();
    }
  }

  setMaxSimultaneousItems(newMax = 3) {
    this.#maxSimultaneousItems = newMax;
    if(this.#isProcessing) {
      this.#process();
    }
  }
}
