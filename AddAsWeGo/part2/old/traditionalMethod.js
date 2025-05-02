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
  
  console.log('mounted our script')




document.addEventListener('DOMContentLoaded', async () => {

    console.log('contents of the dom has been loaded so lets run')
  
  
    let totalRequests = 0
  
  
    let promisesToRun = []

  
    const fetchPokemon = async (url) => {

        let page = await fetch(url)

        if (!page.ok) {
            throw new Error(`Response status: ${page.status}`);
        }
    
        const json = await page.json();

        let {results, next} = json

        let nextBatch = results.map(({url}) => {
            totalRequests++
            return async () => {
                let res = await fetch(url)
                let results = await res.json();
                return results
            }
        })

        if(next) {
            totalRequests++
            await fetchPokemon(next)
        }

        promisesToRun.push(...nextBatch);
    }
  
  const start = performance.now();
  totalRequests++
  await fetchPokemon('https://pokeapi.co/api/v2/pokemon/')

  console.log({promisesToRun})
  let results = await Promise.allSettled(promisesToRun.map((cb) => cb()));

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log('✅ Success:', result.value);
      createTile(result.value)


    } else {
      console.error('❌ Error:', result.reason);
    }
  });

  let endTime = performance.now();
  document.getElementById('timer').innerHTML = `Fetched ${totalRequests} requests in ${endTime - start} ms`
      
  
  





  
  
  });