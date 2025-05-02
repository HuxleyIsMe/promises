/**
 * Alright we have a way to add as we go, but we are still awaiting to return the results to our program... however we urgh don't need that
 * we could actually just return the data as it comes. To me this is making me think we need a way to be able to feed back to the outside consumer 
 * that hey we have new data btw, want to do something with it? 
 * 
 * Well this kinda communication is interesting im kinda thinking about:
 *  - callbacks triggering changes
 *  - PubSub type models
 *  - avoiding cluttering Global scope
 * 
 * 
 * 
 * Ok what we are gonna do to give this a bit of context which will help it make sense for both you and I. We are gonna have a HTML table
 * each promise when resolves should add to the table a row. The promises execute concurrently and take different lengths of time, however i want the right column
 * in the right place.
 */

console.log('mounted our script')


// ok lets say we want to get all of the pokemo available on this app as quickly as possible so

/***
 * 
 * https://pokeapi.co/api/v2/pokemon 
 * 
 * is paginated and returns a list of urls to fetch further information on pokemon
 * 
 * the total count of pokemon is 1302 
 * 
 * we could paginate through the list collecting the url to fetch
 * turn them into promise maker functions then run them through our promise runner
 * get all the results then do something
 * 
 * 
 * however.... we want to start strreight away adding as we go.
 * 
 * We also want to like do something  we could probably even make the promises use the function
 * 
 * 
 * While we test it lets just work on the first 20

 * 
 */

const promiseHandler = (promises, concurrency) => {

    /** Resolver logic to still enable that eventual resolve behaviour */
    let resolver;
    const emptyPromise = new Promise((res, _) => {
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

  const pendingPromises = [...promises];
  
  const bootRunner = () => {
    if(!result.results.length && !pending) {
      let starters = pendingPromises.slice(0, concurrency || 3)
      starters.forEach((cb) => {
        runPromise(cb);
    });
    }
  }

  bootRunner() // boots it self up on first load

  const addPromise = (promise) => {
      pendingPromises.push(promise)
      bootRunner()
  }


  const addPromises = (promises) => {

      pendingPromises.push(...promises)
      
     
      bootRunner()


  }
  
  return { data : emptyPromise, addPromise, addPromises};
};


(async () => {

// hook up our promise resolver



const {data, addPromises} = promiseHandler([],5)


fetch('https://pokeapi.co/api/v2/pokemon/').then((res) => {
  if(!res.ok) {
    console.log('mistake')
    throw new Error(`Request failed with status ${res.status}`);
  }
   return res.json()
}).then((res) => {
  let {results} = res
  let nextBatch = results.map(({url}) => 
    () => fetch(url).then((res) => {
       return res.json()}).then((res) => {
        return res
       })
  )
  addPromises(nextBatch);
  return res
}).catch((err) => {
  console.error('oh no im not working', err.message)
})

  const res = await data

  console.log({res})


})()


/** Alright we run into our first big change how we kick of this runner 
 * before we gave it initial promise to start it but sadly that not gonna work now
 */


/**
 * Ik great now we have  a whole batch of pokemon but as we can see its kinda long doing this json unwrapping business..
 * as im making this handler for fetching data lets just like make the handler handle that
 * It also may be nice to acknowledge this is gonna be used for data fetching
 * 
 */