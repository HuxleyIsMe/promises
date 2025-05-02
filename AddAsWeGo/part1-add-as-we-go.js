const mockPromises = Array.from({ length: 12 }, (_, i) => () =>
    new Promise((res) => setTimeout(() => res(i + 1), Math.random() * 1000))
  );
  
  
//   const runConcurrentPromises = async (promises, concurrency) => {
//     let resolver;
//     const emptyPromise = new Promise((res, _) => {
//       resolver = res;
//     });
//     const result = { results: [], failures: [] };
//     let pending = 0;
  
//     const runPromise = (cb) => {
//       pending++;
//       cb()
//         .then((res) => {
//           result.results.push(res);
//         })
//         .catch((err) => {
//           result.failures.push(err);
//         })
//         .finally(() => {
//           pending--;
//           // chain  another promise if there are more to run
//           if (pendingPromises.length) {
//             let next = pendingPromises.shift();
//             runPromise(next);
//           } else if (pending) {
//             // do nothing
//           } else {
//             resolver(result);
//           }
//         });
//     };
  
//     // here we run the initial promises
//     const initialPromises = promises.slice(0, concurrency);
//     const pendingPromises = promises.slice(concurrency);
  
//     // start of the number of promises that we need
//     initialPromises.forEach((cb) => {
//       runPromise(cb);
//     });
  
//     return emptyPromise;
//   };
//   (async () => {
//     let res = await runConcurrentPromises(mockPromises, 3);
//     console.log({ res });
//   })();

/** 
   * Ok step one lets have a away we can continually add to our underlying throttle lib:
   * 
   * 
   */

  const runConcurrentPromisesContinualAdd = (promises, concurrency) => {

    /** Resolver logic to still enable that eventual resolve behaviour */
    let resolver;
    const emptyPromise = new Promise((res, _) => {
      resolver = res;
    });


    const result = { results: [], failures: [] };
    let pending = 0;

    const runPromise = (cb) => {
      console.log({cb})
      pending++;
      cb()
        .then((res) => {
          result.results.push(res);
        })
        .catch((err) => {
          result.failures.push(err);
        })
        .finally(() => {
          pending--;
          // chain  another promise if there are more to run
          if (pendingPromises.length) {
            let next = pendingPromises.shift();
            runPromise(next);
          } else if (pending) {
            // do nothing
          } else {
            resolver(result);
          }
        });
    };
  // here we run the initial promises
  const initialPromises = promises.slice(0, concurrency);
  const pendingPromises = promises.slice(concurrency);   // <---- This here is where the rest of out promises go it could  make sense to add here. 
  
  // kick starts the number of promises to run 
  initialPromises.forEach((cb) => {
      runPromise(cb);
  });

  const addPromise = (promise) => {
      pendingPromises.push(promise)
  }


  const addPromises = (promises) => {
      pendingPromises.push(...promises)
  }
  
  return {data : emptyPromise, addPromise, addPromises};
};



const otherPromise = () => new Promise((res) => setTimeout(() => res(13), Math.random() * 1000)) // oops i forgot its got to be a promise generator


  let {data, addPromise} = runConcurrentPromisesContinualAdd(mockPromises, 3);

  console.log('hello', addPromise, data)

  addPromise(otherPromise)

  const res = await data
  console.log({ res });


// Huzzah we can add promises as we go! We still need a handy await to resolve the data object returning the results to the context. This is effectively turning everything of
// it would be great if we didnt need to do this.... it would be cool if like we just had our data could do something after