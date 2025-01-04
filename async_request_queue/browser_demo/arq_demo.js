import AsyncRequestQueue from "./async_request_queue.js";

class ArqDemo {
  #internalArq = null;
  #mainContainerElement = null;
  #renderedWaiters = [];
  constructor(mainContainerElement) {
    this.#mainContainerElement = mainContainerElement;
    console.dir(this.#mainContainerElement.innerText);
    let initialWaiters = [];
    for(let c = 0; c < 4; c++) {
      initialWaiters.push(this.#createWaiter());
    }
    this.#internalArq = new AsyncRequestQueue(initialWaiters);
  }
  #createWaiter() {
    console.log('addWaiter() called');
    //const durationMs = 250+(Math.random()*10000);
    const durationMs = 3000;
    const rgbColorCodeValues = `${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}`;
    const waiter = {};
    waiter.waiterElement = document.createElement('div');
    waiter.waiterElement.style = `background: rgb(${rgbColorCodeValues}, 37%)`;
    waiter.waiterElement.innerText = `Waiting to run for ${Math.round((durationMs/1000)*100)/100} seconds...`;
    waiter.waiterElement.classList.add('waiter');
    this.#mainContainerElement.appendChild(waiter.waiterElement);
    return () => {
      const startTime = Date.now();
      waiter.waiterElement.style = `background: rgb(${rgbColorCodeValues});`;
      waiter.waiterElement.innerText = `Now RUNNING for ${Math.round((durationMs/1000)*100)/100} seconds...`;
      waiter.waiterElement.classList.toggle('running');
      waiter.update = function(text) { this.waiterElement.innerText = text};
      this.#renderedWaiters.push(waiter);
      return new Promise( (resolve, reject) => {
        setTimeout(() => {
          const runTimeSeconds = parseInt(((Date.now() - startTime)/1000)*100)/100;
          const finishedMessage = `FINISHED running after ${runTimeSeconds} seconds`;
          waiter.waiterElement.style = `background: rgb(${rgbColorCodeValues}, 37%)`;
          waiter.update(finishedMessage);
          waiter.waiterElement.classList.toggle('running');
          resolve(finishedMessage);
        }, durationMs);
      });
    }
  }
  #render() {
  }
  #startDemo() {
    this.#internalArq.startProcessing().then( (result) => { console.log('done processing'); console.dir(result);});
    
  }
  #buildInitialInterface() {
    this.startButton = document.createElement('button');
    this.startButton.innerText = 'Start';
    this.startButton.addEventListener('click', () => {
      this.#startDemo()
    }); 
    this.addButton = document.createElement('button');
    this.addButton.innerText = 'Add Waiter';
    this.addButton.addEventListener('click', () => {
      this.#internalArq.enqueue(this.#createWaiter());
    }); 
    this.#mainContainerElement.appendChild(this.startButton);
    this.#mainContainerElement.appendChild(this.addButton);
  }
  enqueueItem() {
  }
  initialize() {
    this.#buildInitialInterface();
  }
};


document.addEventListener('DOMContentLoaded', () => {
  const demo1 = new ArqDemo(document.getElementById('mainContainer'));
  demo1.initialize();
});

