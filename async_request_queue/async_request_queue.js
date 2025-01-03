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
    /////console.log('------- process() called. curId='+curId+' ------- ');
    /////console.log('queue length = '+this.#queue.length);
    if(this.#queue.length === 0 ) {
      /////console.log('resolve curId='+curId);
      /////console.groupEnd();
      return;
    }
    if(this.#currentItemsRunning < this.#maxSimultaneousItems) {
      /////console.log('run another item. curId='+curId);
      this.#executionQueue.push(this.#runItem(this.#queue.pop()));
      this.#currentItemsRunning++;
      /////console.dir(`currentItemsRunning=${this.#currentItemsRunning}`);
      await this.#process(); 
    }
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

function waiter1() {
  console.log(' >> waiter1() started')
  return new Promise( (resolve, reject) => {
    setTimeout(() => {
      console.log(' << waiter1 completed');
      resolve('waiter1 complete');
    }, 1000);
  });
}

function waiter2() {
  console.log(' >> waiter2() started')
  return new Promise( (resolve, reject) => {
    setTimeout(() => {
      console.log(' << waiter2 completed');
      resolve('waiter2 complete');
    }, 2000);
  });
}

function waiter3() {
  console.log(' >> waiter3() started')
  return new Promise( (resolve, reject) => {
    setTimeout(() => {
      console.log(' << waiter3 completed');
      resolve('waiter3 complete');
    }, 3000);
  });
}

function waiter5() {
  console.log(' >> waiter5() started')
  return new Promise( (resolve, reject) => {
    setTimeout(() => {
      console.log(' << waiter5 completed');
      resolve('waiter5 complete');
    }, 5000);
  });
}

function waiter15() {
  console.log('\x1b[41m', ' >> waiter15() started', '\x1b[0m')
  return new Promise( (resolve, reject) => {
    setTimeout(() => {
      console.warn('\x1b[42m', ' << waiter15 completed', '\x1b[0m');
      resolve('waiter15 complete');
    }, 15000);
  });
}

function makeSpaces(length) {
  let spaces = '';
  for(let i=0; i < length;i++) {
    spaces += ' ';
  }
  return spaces;
}

function makeWaiter(id = "no id set", timeout = 1000, highlight = false) {
  return function() {
    const spaceLength = Math.floor(timeout/300)+1;
    if(highlight) {
      console.log(makeSpaces(spaceLength), '\x1b[41m',  ` >> waiter ${id} start, wait ${Math.floor(timeout/1000)} secs...`, '\x1b[0m');
    } else {
      console.log(makeSpaces(spaceLength), ` >> waiter ${id} start, wait ${Math.floor(timeout/1000)} secs...`);
    }
    return new Promise( (resolve, reject) => {
      setTimeout(() => {
        if(highlight) {
          console.warn(makeSpaces(spaceLength), '\x1b[42m',  ` ...waiter ${id} completed!`, '\x1b[0m');
        } else {
          console.warn(makeSpaces(spaceLength), ` ...waiter ${id} completed!`);
        }
        resolve(`waiter ${id} complete!`);
      }, timeout);
    });
  }
}
/*
  waiter1,
  waiter2,
  waiter3,
*/

/*
const arq1 = new AsyncRequestQueue([
  waiter1,
  waiter2,
  waiter3,
  waiter3,
  waiter15,
  waiter1,
  waiter3,
  waiter3,
  waiter1,
  waiter2,
  waiter3,
  waiter1,
  waiter15,
]);
*/

let curId = 0;
let waitersList = [makeWaiter(curId++, 30000, true)];
for(let c = 0; c < 5; c++) {
  waitersList.push(makeWaiter(curId++, Math.random()*3000, false));
}
waitersList.push(makeWaiter(curId++, 30000, true));
for(let c = 0; c < 5; c++) {
  waitersList.push(makeWaiter(curId++, (Math.random()*5000)+3000, false));
}
for(let c = 0; c < 5; c++) {
  waitersList.push(makeWaiter(curId++, (Math.random()*5000)+5000, false));
}
waitersList.push(makeWaiter(curId++, 30000, true));

const arq1 = new AsyncRequestQueue(waitersList);
//const finalVals = await arq1.startProcessing();
//const finalVals = arq1.startProcessing();
arq1.startProcessing().then( (finalVals) => {
  console.log('-----------------');
  console.dir(finalVals);
});

for(let x = 0; x < 5; x++) {
  setTimeout( () => {
    console.log('                        !! enqueue new waiter !!');
    arq1.enqueue(makeWaiter(100+curId++, Math.random()*5000, true));
  }, 100*x);
}


for(let x = 0; x < 5; x++) {
  setTimeout( () => {
    console.log('                        !! enqueue new waiter !!');
    arq1.enqueue(makeWaiter(100+curId++, Math.random()*5000, true));
  }, (2000*x)+10000);
}
