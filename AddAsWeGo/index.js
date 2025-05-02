const mockPromises = Array.from({ length: 12 }, (_, i) => () =>
    new Promise((res) => setTimeout(() => res(i + 1), Math.random() * 1000))
  );
  
  
  const runConcurrentPromises = async (promises, concurrency) => {
    let resolver;
    const emptyPromise = new Promise((res, rej) => {
      resolver = res;
    });
    const result = { results: [], failures: [] };
    let pending = 0;
  
    const runPromise = (cb) => {
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
    const pendingPromises = promises.slice(concurrency);
  
    // start of the number of promises that we need
    initialPromises.forEach((cb) => {
      runPromise(cb);
    });
  
    return emptyPromise;
  };
  (async () => {
    let res = await runConcurrentPromises(mockPromises, 3);
    console.log({ res });
  })();