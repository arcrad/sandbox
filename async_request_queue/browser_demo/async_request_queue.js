export default class AsyncRequestQueue {
  #queue = [];
  #executionQueue = [];
  #maxSimultaneousItems = 3;
  #currentItemsRunning = 0;
  #processCompleteHandler = null;
  #processPromise = null;
  #isProcessing = false;
  #id = 0;

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

  #process() {
    //const curId = this.#id++;
    //console.log('------- process() called. curId='+curId+' ------- ');
    /////console.log('queue length = '+this.#queue.length);
    if(this.#queue.length > 0 && this.#currentItemsRunning < this.#maxSimultaneousItems) {
      /////console.log('run another item. curId='+curId);
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
            //allItemsDoneRunning();
            this.#processCompleteHandler();
            return;
          }
        }
      );
      this.#currentItemsRunning++;
      /////console.dir(`currentItemsRunning=${this.#currentItemsRunning}`);
      this.#process(); 
    }
    /////console.log('------- end process() call with curId='+curId+' -------');
  }

  startProcessing() {
    if(this.#isProcessing === true) {
      //Allow calling multiple times while processing? 
      //return Promise.reject('Already processing');// this.#processPromise;
      return this.#processPromise;
    }
    if(this.#isProcessing === false && this.#queue.length === 0) {
      this.#processCompleteHandler();
      return this.#processPromise;
    }
    this.#isProcessing = true;
    this.#processPromise = new Promise( (resolve, reject) => {
      this.#processCompleteHandler = () => {
        console.log('the queue has been emptied');
        console.dir(this.#executionQueue);
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
