export const createTile = (pokemonJson) => {

    let element = `<div class="tile">
    <div><img src="${pokemonJson.sprites.front_default}"/></div>
    <div>
        <h5>${pokemonJson.name}</h5>
    </div>
    </div>`

    document.getElementById('pokemon-container').appendChild(element)
}

