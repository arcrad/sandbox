export default class AsyncRequestQueue {
  #queue = [];
  #executionQueue = [];
  #maxSimultaneousItems = 3;
  #currentItemsRunning = 0;
  #id = 0;
  constructor(initialItems) {
    this.#queue = [...initialItems];
  }
  
  #runItem(item) {
    return new Promise( async (resolve, reject) => {
      let retVal;
      try {
        /////console.dir(item);
        retVal = await item();
        this.#currentItemsRunning--;
        await this.#process();
        resolve(retVal);
      } catch(error) {
        reject(error); 
      } 
    });
  }

  async #process() {
    const curId = this.#id++;
    console.log('------- process() called. curId='+curId+' ------- ');
    /////console.log('queue length = '+this.#queue.length);
    if(this.#queue.length === 0 ) {
      /////console.log('resolve curId='+curId);
      /////console.groupEnd();
      return;
    }
    if(this.#currentItemsRunning < this.#maxSimultaneousItems) {
      /////console.log('run another item. curId='+curId);
      this.#executionQueue.push(this.#runItem(this.#queue.shift()));
      this.#currentItemsRunning++;
      /////console.dir(`currentItemsRunning=${this.#currentItemsRunning}`);
      //await this.#process(); 
      this.#process(); 
    }
    //return Promise.allSettled(this.#executionQueue);
    return Promise.race(this.#executionQueue);


    /////console.log('------- end process() call with curId='+curId+' -------');
  }

  async startProcessing() {
    await this.#process();
    return Promise.allSettled(this.#executionQueue);
  }

  enqueue(newItem) {
    this.#queue.push(newItem);
  }
}
