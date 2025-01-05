import AsyncRequestQueue from "./async_request_queue.js";

class ArqDemo {
  #internalArq = null;
  #mainContainerElement = null;
  #renderedWaiters = [];
  #currentWaiterId = 0;
  constructor(mainContainerElement) {
    this.#mainContainerElement = mainContainerElement;
    console.dir(this.#mainContainerElement.innerText);
    let initialWaiters = [];
    for(let c = 0; c < 4; c++) {
      initialWaiters.push(this.#createWaiter());
    }
    initialWaiters.push(this.#createWaiter(10000));
    this.#internalArq = new AsyncRequestQueue(initialWaiters);
  }
  #getId() {
    return this.#currentWaiterId++;
  }
  #createWaiter(timeoutMs = null) {
    console.log('addWaiter() called');
    if(!timeoutMs) {
      timeoutMs = 250+(Math.random()*10000);
    }
    //const rgbColorCodeValues = `${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}`;
    const rgbColorCodeValues = 
      `${Math.floor((Math.random()*127)+128)},`+
      `${Math.floor((Math.random()*127)+128)},`+
      `${Math.floor((Math.random()*127)+128)}`;
    const timeoutSeconds = Math.round((timeoutMs/1000)*100)/100;
    const id = this.#getId();
    const waiter = {};
    waiter.waiterElement = document.createElement('div');
    //waiter.waiterElement.innerText = `Waiting to run for ${Math.round((timeoutMs/1000)*100)/100} seconds...`;
    waiter.waiterElement.classList.add('waiter');
    waiter.textContainer = document.createElement('div');
    waiter.textContainer.classList.add('textContainer');
    //waiter.textContainer.style = `background: rgb(${rgbColorCodeValues}, 37%)`;
    waiter.textContainer.style = `background: rgb(${rgbColorCodeValues})`;
    waiter.idBox = document.createElement('div');
    waiter.idBox.classList.add('idBox');
    waiter.timeoutBox = document.createElement('div');
    waiter.timeoutBox.classList.add('timeoutBox');
    waiter.runtimeBox = document.createElement('div');
    waiter.runtimeBox.classList.add('runtimeBox');
    waiter.progressBar = document.createElement('div');
    waiter.progressBar.classList.add('progressBar');
    waiter.textContainer.appendChild(waiter.idBox);
    waiter.textContainer.appendChild(waiter.timeoutBox);
    waiter.textContainer.appendChild(waiter.runtimeBox);
    waiter.waiterElement.appendChild(waiter.textContainer)
    waiter.waiterElement.appendChild(waiter.progressBar);
    waiter.idBox.innerText = id;
    waiter.timeoutBox.innerText = timeoutSeconds;
    waiter.runtimeBox.innerText = "--";
    this.#mainContainerElement.prepend(waiter.waiterElement);
    this.#renderedWaiters.push(waiter);
    return () => {
      const startTime = Date.now();
      //waiter.waiterElement.style = `background: rgb(${rgbColorCodeValues});`;
      //waiter.waiterElement.innerText = `Now RUNNING for ${Math.round((timeoutMs/1000)*100)/100} seconds...`;
      waiter.waiterElement.classList.toggle('running');
      waiter.textContainer.style = `background: rgb(${rgbColorCodeValues});`;
      waiter.progressBar.style = `animation-duration: ${timeoutSeconds}s`;
      /////this.#renderedWaiters.push(waiter);
      return new Promise( (resolve, reject) => {
        setTimeout(() => {
          const runtimeSeconds = parseInt(((Date.now() - startTime)/1000)*100)/100;
          const finishedMessage = `FINISHED running after ${runtimeSeconds} seconds`;
          //waiter.textContainer.style = `background: rgb(${rgbColorCodeValues}, 37%)`;
          waiter.textContainer.style = null;
          waiter.runtimeBox.innerText = runtimeSeconds;
          waiter.waiterElement.classList.add('done');
          waiter.waiterElement.classList.toggle('running');
          if(Math.random() > 0.5) {
            waiter.waiterElement.classList.add('resolved');
            resolve(finishedMessage);
          } else {
            waiter.waiterElement.classList.add('rejected');
            reject(finishedMessage);
          }
        }, timeoutMs);
      });
    }
  }
  #addCompleteNotice(data) {
    for(let item of data) {
      console.dir(item);
    }
    const notice = {};
    notice.noticeElement = document.createElement('div');
    notice.noticeElement.classList.add('notice');
    notice.noticeElement.innerText = 'All items settled!';
    this.#mainContainerElement.prepend(notice.noticeElement);
    return notice;
  }
  #render() {
  }
  #startDemo() {
    this.#internalArq.startProcessing().then(
      (result) => { 
        console.log('done processing');
        console.dir(result);
        this.#addCompleteNotice(result);
      }
    );
  }
  #changeConcurrency(newValue) {
    console.log('change concurrency');
    this.#internalArq.setMaxSimultaneousItems(newValue);
  }
  #buildInitialInterface() {
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.classList.add('controlsContainer');
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
    this.concurrencyDropdown  = document.createElement('select');
    for(let c = 1; c < 11; c++) {
      const newOption = document.createElement('option');
      newOption.value = c;
      newOption.innerText = c;
      this.concurrencyDropdown.appendChild(newOption);
    }
    this.concurrencyDropdown.addEventListener(
      'change',
      (event) => { 
        this.#changeConcurrency(event.target.value);
      }
    );
    this.controlsContainer.appendChild(this.startButton);
    this.controlsContainer.appendChild(this.addButton);
    this.controlsContainer.appendChild(this.concurrencyDropdown);
    this.#mainContainerElement.appendChild(this.controlsContainer);
  }
  initialize() {
    this.#buildInitialInterface();
  }
};


document.addEventListener('DOMContentLoaded', () => {
  const demo1 = new ArqDemo(document.getElementById('mainContainer'));
  demo1.initialize();
});

