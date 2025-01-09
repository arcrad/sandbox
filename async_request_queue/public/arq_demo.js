import AsyncRequestQueue from "./async_request_queue.js";

class ArqDemo {
  #internalArq = null;
  #mainContainerElement = null;
  #renderedWaiters = [];
  #currentWaiterId = 0;
  #prevNumFulfilled = 0;
  #prevNumRejected = 0;

  constructor(mainContainerElement) {
    this.#mainContainerElement = mainContainerElement;
    this.#buildInitialInterface();
    // Add initial waiters.
    let initialWaiters = [this.#createWaiter(10000)];
    for(let c = 0; c < 4; c++) {
      initialWaiters.push(this.#createWaiter());
    }
    this.#internalArq = new AsyncRequestQueue(initialWaiters);
  }

  #buildInitialInterface() {
    this.waiterContainer = document.createElement('div');
    this.waiterContainer.classList.add('waiterContainer');
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.classList.add('controlsContainer');
    this.startButton = document.createElement('button');
    this.startButton.innerText = 'Start';
    this.startButton.addEventListener('click', () => {
      this.#start()
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
      if(c === 3) {
        newOption.selected = true;
      }
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
    this.#mainContainerElement.appendChild(this.waiterContainer);
    this.#mainContainerElement.appendChild(this.controlsContainer);
  }

  #getId() {
    return this.#currentWaiterId++;
  }

  #createWaiter(timeoutMs = null) {
    if(!timeoutMs) {
      timeoutMs = 250+(Math.random()*10000);
    }
    const rgbColorCodeValues = 
      `${Math.floor((Math.random()*127)+128)},`+
      `${Math.floor((Math.random()*127)+128)},`+
      `${Math.floor((Math.random()*127)+128)}`;
    const timeoutSeconds = Math.round((timeoutMs/1000)*100)/100;
    const id = this.#getId();
    const waiter = {};
    waiter.waiterElement = document.createElement('div');
    waiter.waiterElement.classList.add('waiter');
    waiter.textContainer = document.createElement('div');
    waiter.textContainer.classList.add('textContainer');
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
    this.waiterContainer.prepend(waiter.waiterElement);
    this.#renderedWaiters.push(waiter);
    return () => {
      const startTime = Date.now();
      waiter.waiterElement.classList.add('running');
      waiter.textContainer.style = `background: rgb(${rgbColorCodeValues});`;
      waiter.progressBar.style = `animation-duration: ${timeoutSeconds}s`;
      return new Promise( (resolve, reject) => {
        setTimeout(() => {
          const runtimeSeconds = parseInt(((Date.now() - startTime)/1000)*100)/100;
          const finishedMessage = `FINISHED running after ${runtimeSeconds} seconds`;
          waiter.textContainer.style = null;
          waiter.runtimeBox.innerText = runtimeSeconds;
          waiter.waiterElement.classList.add('done');
          waiter.waiterElement.classList.remove('running');
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

  #addStartNotice(data) {
    const notice = {};
    notice.noticeElement = document.createElement('div');
    notice.noticeElement.classList.add('notice');
    notice.noticeElement.innerHTML = `Start processing...`;
    this.waiterContainer.prepend(notice.noticeElement);
    return notice;
  }

  #addCompleteNoticePlaceholder() {
    const noticePlaceholderElement = document.createElement('div');
    this.waiterContainer.prepend(noticePlaceholderElement);
    return noticePlaceholderElement;
  }

  #createCompleteNotice(data) {
    let numFulfilled = 0;
    let numRejected = 0;
    for(let item of data) {
      if(item.status === 'fulfilled') {
        numFulfilled++;
      } else {
        numRejected++;
      }
    }
    const deltaFulfilled = numFulfilled - this.#prevNumFulfilled;
    const deltaRejected = numRejected - this.#prevNumRejected;
    this.#prevNumFulfilled = numFulfilled;
    this.#prevNumRejected = numRejected;
    const notice = {};
    notice.noticeElement = document.createElement('div');
    notice.noticeElement.classList.add('notice');
    notice.noticeElement.innerHTML = 
      `All waiters settled!<br>` +
      `${deltaFulfilled} waiters fulfilled (${numFulfilled} total).<br>` +
      `${deltaRejected} waiters rejected (${numRejected} total).`;
    return notice;
  }

  #start() {
    this.#addStartNotice();
    this.#internalArq.startProcessing().then(
      (result) => { 
        const noticePlaceholder = this.#addCompleteNoticePlaceholder();
        setTimeout( () => {
          noticePlaceholder.replaceWith(this.#createCompleteNotice(result).noticeElement);
        }, 250);
      }
    );
  }

  #changeConcurrency(newValue) {
    this.#internalArq.setMaxSimultaneousItems(newValue);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const demo1 = new ArqDemo(document.getElementById('mainContainer'));
});

