// let last = performance.now();
// setInterval(() => {
//   const now = performance.now();
//   const delay = now - last - 1000;
//   last = now;
//   if (delay > 200) {
//     console.warn(`Event loop is lagging by ${delay.toFixed(2)}ms`);
//   }
// }, 1000);

// if (performance.memory) {
//   setInterval(() => {
//     const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
//     console.log(`Used JS Heap: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
//     console.log(`Total JS Heap: ${(totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
//     console.log(`Heap Size Limit: ${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
//   }, 1000);
// } else {
//   console.log('performance.memory is not available in this browser');
// }

const createTile = (pokemonJson) => {
  let element = document.createElement('div');
  element.innerHTML = `<div class="tile">
    <div><img src="${pokemonJson.sprites.front_default}"/></div>
    <div>
        <h5>${pokemonJson.name}</h5>
         <h6>${pokemonJson.id}</h6>
    </div>
  </div>`
  document.getElementById('pokemon-container').appendChild(element.firstChild)
}


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

   let currentConcurrency = concurrency || 3

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
      let starters = pendingPromises.splice(0, currentConcurrency)

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



document.addEventListener('DOMContentLoaded', () => {

  console.log('contents of the dom has been loaded so lets run')


  let totalRequests = 0


const {data, addPromises} = promiseHandler([], 15)

const fetchPokemon = (url) => {
  fetch(url).then((res) => {
    if(!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
     return res.json()
  }).then((res) => {
    let {results, next} = res
    let nextBatch = results.map(({url}) => { 
      totalRequests++
      return () => fetch(url).then((res) => {
         return res.json()}).then((res) => {
          createTile(res)
          return res
         })
      })
    addPromises(nextBatch);
    if(next) {
      totalRequests++
      fetchPokemon(next)
    }
    return res
  }).catch((err) => {
    console.error('oh no im not working', err.message)
  })

}

const start = performance.now();
totalRequests++
fetchPokemon('https://pokeapi.co/api/v2/pokemon/')



  data.then((res) => {
    console.log('ran everything ok')
  }).catch(err => {
    console.error('oh nooo', error)
  }).finally(()=> {
    let endTime = performance.now();
    document.getElementById('timer').innerHTML = `Fetched ${totalRequests} requests in ${endTime - start} ms`
  })


});


/** Alright we run into our first big change how we kick of this runner 
 * before we gave it initial promise to start it but sadly that not gonna work now
 */


/**
 * Ik great now we have  a whole batch of pokemon but as we can see its kinda long doing this json unwrapping business..
 * as im making this handler for fetching data lets just like make the handler handle that
 * It also may be nice to acknowledge this is gonna be used for data fetching... 
 * 
 * but i guess the first thing is letting it do something on resolution 
 * 
 * - we could simply provide another callback telling in to add itself as a row in our table? boring but would work. 
 * - 
 * 
 */