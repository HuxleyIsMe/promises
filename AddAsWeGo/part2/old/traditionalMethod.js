const createTile = (pokemonJson) => {
    let element = document.createElement('div');
    element.innerHTML = `<div class="tile">
    <div><img src="${pokemonJson.sprites.front_default || "https://media.tenor.com/S3dxutdK-9AAAAAe/oopsie-oops.png"}"/></div>
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
  
    let result = [];
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
                createTile(results)
                return results
            }
        })

        let batch = await Promise.allSettled(nextBatch.map((cb) => cb()));
        result.push(batch)

        if(next) {
            totalRequests++
            await fetchPokemon(next)
        }

    }
  
  const start = performance.now();
  window.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      console.log('Enter key pressed!', performance.now() - start);
      // Do something here
    }
  });
  totalRequests++


  await fetchPokemon('https://pokeapi.co/api/v2/pokemon/')

  console.log('running at ', performance.now() - start)

  result.forEach(batch => {
    batch.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log('✅ Success:');
  
  
      } else {
        console.error('❌ Error:', result.reason);
      }
    });
  })


  let endTime = performance.now();
  document.getElementById('timer').innerHTML = `Fetched ${totalRequests} requests in ${endTime - start} ms`
    
  });