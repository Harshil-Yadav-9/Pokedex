const pokemon_sec = document.querySelector(".pokemon-sec");
const loadMore = document.querySelector(".load-more");
let numOfPoke = 0;
const maxPokemon = 1025;
const search_poke = document.querySelector("#poke-search");
const pokédex = document.querySelector(".pokédex");

//when click this the webpage go to pokedex(like a refresh)
pokédex.addEventListener("click", () => {
    window.location.href = "index.html";
    return;
});

//to collect name and id of all the pokemons
const load_all_poke = async (URL) => {

    try{
        let res = await fetch(URL);
        let data = await res.json();
        let i = 0;
        allPokemonData = data.results.map(p => {
            i++;
            return {
                name: p.name,
                id: i
            };
        });    
    } catch (err) {
        console.error("Failed to load list.", err);
    }
}

const pokemon = async (poke_name,poke_url,new_poke) => {
    numOfPoke++;

    try{
        let res = await fetch(poke_url);
        let data = await res.json();
        let formattedId = data.id.toString().padStart(4,'0');

        //to add the card in pokemon_sec div as a new_poke div
        new_poke.innerHTML = `
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${poke_name}" class="poke-img"/>
            <div class="poke-detail">
                <span class="poke-num">#${formattedId}</span>
                <div class="name-poke">${poke_name}</div>
                <div class="type-poke">
                    ${data.types.map(t => `<div class="box ${t.type.name}">${t.type.name}</div>`).join('')}
                </div>
            </div>
            `;

        //to click the card of one pokemon then go to the details of that pokemon
        new_poke.addEventListener("click",() => {
            new_poke.classList.toggle("poke-border");
            window.location.href = `details.html?id=${data.id}`;
        });
    } catch (err) {
        console.error("Failed to load list", err);
    }
}

//fetch the data and create card for pokemons
const load_more_poke = async (URL) => {
    
    try{
        let res = await fetch(URL);
        let data = await res.json();
        let len = data.results.length;
        
        for(let i = 0;i < len;i++){

            //create a card for each pokemon and get the data
            const new_poke = document.createElement("div");
            new_poke.classList.add("pokemon");
            pokemon_sec.appendChild(new_poke);

            pokemon(data.results[i].name , data.results[i].url, new_poke);
        }
    } catch (err) {
        console.error("Failed to load list", err);
    }
}

//display pokemon according to search
const displaySearchResult = (filterPoke) => {

    //to hide the "load more" button
    loadMore.style.display = "none";

    //if you erase the search or the search value doesn't match with pokemon's id or name.
    if (filterPoke.length === 0) {
        pokemon_sec.innerHTML = `<div class="not-found">No Pokémon Found 😢</div>`;
        return;
    }
    //search value match
    const newCards = filterPoke.map(pokemon => {

        const imgURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        const formattedId = pokemon.id.toString().padStart(4,'0');

        //to return whole html tag as new filtered card
        return `
        <div class="pokemon" onclick="window.location.href='details.html?id=${pokemon.id}'">
            <img src="${imgURL}" alt="${pokemon.name}" class="poke-img">
            <div class="poke-detail">
                <span class="poke-num">#${formattedId}</span>
                <div class="name-poke">${pokemon.name}</div>
            </div>
        </div>
        `;
    }).join("");

    //new cards add to the pokemon_sec div
    pokemon_sec.innerHTML = newCards;
}

//when first load the for fetch first 12 pokemon's details and all pokemon's name and id
window.addEventListener("load", () => {

    const URL1 = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
    load_more_poke(URL1);
    const URL2 = "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0";
    load_all_poke(URL2);
});

//load next pokemons
loadMore.addEventListener("click",() => {

    //12 pokemon at each time
    if(numOfPoke < 1014){
        const URL = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${numOfPoke}"`;
        load_more_poke(URL);
    }

    //rest of the pokemons
    else if(numOfPoke < 1026){
        const URL = `https://pokeapi.co/api/v2/pokemon?limit=${1025 - numOfPoke}&offset=${numOfPoke}"`;
        load_more_poke(URL);
    }
});

//to search the pokemon with name or id
search_poke.addEventListener("input", (e) => {

    //get the value from search
    const val = e.target.value.toLowerCase();

    //if val is null then get the first 12 pokemon's data
    if (val === "") {
        pokemon_sec.innerHTML = "";
        loadMore.style.display = "block";
        numOfPoke = 0;
        
        const URL = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
        load_more_poke(URL);
        return;
    }

    //verify the val of pokemon as id or name 
    const filterPokemon = allPokemonData.filter(pokemon => {
        return pokemon.name.includes(val) || pokemon.id.toString() === val;
    });
    displaySearchResult(filterPokemon);
});