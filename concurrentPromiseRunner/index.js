// /**
//  * Promises
//  *
//  * anything can be a promise if you want it to
//  * i promise one day i will do this thing.
//  *
//  *
//  *
//  *
//  */
const throttler = (currency) =>
  (() => {
    let maxConcurrency = 3;
    let running = 0;
    let results = {};

    let pendingPromises = [];

    const run = ({ cb, orderNumber }) => {
      running++;
      cb()
        .then((res) => {
          results[orderNumber] = res;
        })
        .catch((err) => {
          results[orderNumber] = err;
        })
        .finally(() => {
          running--;

          // more promises to run
          if (pendingPromises.length > 0 && running <= maxConcurrency) {
            const next = pendingPromises.shift();
            run(next);
          }
        });
    };

    let orderNumber = 0;

    const add = (cb) => {
      orderNumber++;
      if (running <= maxConcurrency) {
        run({ cb, orderNumber });
      } else {
        pendingPromises.push({ cb, orderNumber });
      }
    };

    return { add, results, cb };
  })();

const throt = throttler(3);

let firstHalf = mockPromises.slice(0, 6);
let secondHalf = mockPromises.slice(6);

firstHalf.forEach((p) => {
  throt.add(p);
});

setInterval(() => {
  console.log(throt.results);
}, 1000);

setTimeout(() => {
  console.log("adding later batch");
  secondHalf.forEach((p) => {
    throt.add(p);
  });
}, 6000);

// this is really cool, but like to be useful in our program we only want the value to be returned
// when there has been a change
