import AsyncRequestQueue from './async_request_queue.js';

function makeSpaces(length) {
  let spaces = '';
  for(let i=0; i < length;i++) {
    spaces += ' ';
  }
  return spaces;
}

function makeWaiter(id = "no id set", timeout = 1000, highlight = false) {
  return function waiter() {
    const startTime = Date.now();
    const spaceLength = Math.floor(timeout/300)+1;
    console.log(
      makeSpaces(spaceLength),
      highlight ? '\x1b[41m' : '',
      ` >> waiter ${id} start, wait ${parseInt((timeout/1000)*100)/100} secs...`,
      '\x1b[0m'
    );
    return new Promise( (resolve, reject) => {
      setTimeout(() => {
        const runTimeSeconds = parseInt(((Date.now() - startTime)/1000)*100)/100;
        console.log(
          makeSpaces(spaceLength),
          highlight ? '\x1b[42m' : '',
          ` ...waiter ${id} completed in ${runTimeSeconds} seconds!`,
          '\x1b[0m'
        );
        resolve(`waiter ${id} completed in ${runTimeSeconds} seconds!`);
      }, timeout);
    });
  }
}

let curId = 0;
let waitersList = [makeWaiter(curId++, 10000, true)];

/*
for(let c = 0; c < 3; c++) {
  waitersList.push(makeWaiter(curId++, Math.random()*3000, false));
}
waitersList.push(makeWaiter(curId++, 30000, true));
for(let c = 0; c < 3; c++) {
  waitersList.push(makeWaiter(curId++, (Math.random()*5000)+3000, false));
}
for(let c = 0; c < 3; c++) {
  waitersList.push(makeWaiter(curId++, (Math.random()*5000)+5000, false));
}
waitersList.push(makeWaiter(curId++, 30000, true));

*/

waitersList.push(makeWaiter(curId++, 1000, true));
waitersList.push(makeWaiter(curId++, 1000, true));
waitersList.push(makeWaiter(curId++, 1000, true));
waitersList.push(makeWaiter(curId++, 5000, true));
waitersList.push(makeWaiter(curId++, 1000, true));

const arq1 = new AsyncRequestQueue(waitersList);

arq1.startProcessing().then( (finalVals) => {
  console.log('-----------------');
  console.dir(finalVals);
});

for(let x = 0; x < 3; x++) {
  setTimeout( () => {
    console.log('                        !! enqueue new waiter !!');
    arq1.enqueue(makeWaiter(100+curId++, Math.random()*5000, true));
  }, 100*x);
}

/*
for(let x = 0; x < 3; x++) {
  setTimeout( () => {
    console.log('                        !! enqueue new waiter !!');
    arq1.enqueue(makeWaiter(100+curId++, Math.random()*5000, true));
  }, (2000*x)+7000);
}
*/

