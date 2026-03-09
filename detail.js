const pokédex = document.querySelector(".pokédex");

pokédex.addEventListener("click", () => {
    window.location.href = "index.html";
    return;
});

//whole individual pokemon details
function renderDetails(data, category, ability, weakness, strength, evoChain) {
    const container = document.querySelector("#details-container");
    
    container.innerHTML = `
        <div class="indl-poke-detail">
            <div class="header-name">
                <div class="poke-name">${data.name}</div>
                <div class="id-badge">#${data.id.toString().padStart(4,'0')}</div>
            </div>
            <div class="poke-img-info">
                <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}" class="indl-poke-img">
                <div class="info-grid">
                    <div class="grid1">
                        <div class="height item">
                            <div class="height item-name"><b>Height</b></div>
                            <div class="item-val">${data.height / 10}m</div>
                        </div>
                        <div class="weight item">
                            <div class="item-name"><b>Weight</b> </div>
                            <div class="item-val">${data.weight / 10}kg</div>
                        </div>
                    </div>
                    <div class="grid2">
                        <div class="catagory-indl item">
                            <div class="item-name"><b>Catagory</b></div>
                            <div class="item-val">${category}</div>
                        </div>
                        <div class="ability item">
                            <div class="item-name"><b>Ability</b> </div>
                            <div class="item-val">${ability.map(t => t).join('<br>')}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="type-weak-strength">
                <div class="type-poke">
                    <div class="type-box">Types: </div> <br>
                    ${data.types.map(t => `<div class="box ${t.type.name}">${t.type.name}</div>`).join('')}
                </div>
                <div class="type-poke">
                    <div class="type-box">Weakness: </div> <br>
                    ${weakness.map(t => `<div class="box ${t.name}">${t.name}</div>`).join('')}
                </div>
                <div class="type-poke">
                    <div class="type-box">Strength: </div> <br> 
                    ${strength.map(t => `<div class="box ${t.name}">${t.name}</div>`).join('')}
                </div>
            </div>
            <div class="base_state">
                <div class="title-base-stats">Base Stats</div>
                <div class="stats-container">
                    ${data.stats.map(s => `
                        <div class="stat-row">
                            <span class="all-stats">${s.stat.name.replace('-',' ')}</span>
                            <div class="bar-bg">
                                <div class="bar-fill" style="width: ${(s.base_stat / 255) * 100}%; animation-delay: 0.1s"></div>
                            </div>
                            <span class="stats-num">${s.base_stat}</span>
                        </div>
                    `).join(" ")}
                </div>
            </div>
            <div class="evolution"><span class="evolution-title">Evolutions</span>
                <div class="poke-gen">
                    ${evoChain.map(e => `
                        <div class="poke-evo" id="${e.id}">
                            <div class="poke-evo-img">
                                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.id}.png" alt="${e.name}" class="evo-poke-img"/>   
                            </div>
                            <div class="poke-evo-name">
                                <div class="gen-name">${e.name}</div>
                                <div class="gen-id">#${e.id.toString().padStart(4,'0')}</div>
                                <div class="type-poke">${e.types.map(t => `
                                    <div class="box ${t}">${t}</div>
                                `).join(" ")}
                                </div>
                            </div>
                        </div>
                    `).join(" ")}
                </div>
            </div>
        </div>
    `;

    const poke_gen = document.querySelector(".poke-gen");
    //go to the pokemon which is in evolution path
    poke_gen.addEventListener("click", (e) => {
        const card = e.target.closest(".poke-evo");
        if(card){
            const clickedId = card.id;
            window.location.href = `details.html?id=${clickedId}`;
            return;
        }
    });

    const stats_container = document.querySelector(".stats-container");
    //base state animation
    const observer = new IntersectionObserver((entry) => {
        entry.forEach(entry => {
            if(entry.isIntersecting){
                stats_container.classList.add("start-animation");
                observer.unobserve(entry.target);
            }
        });
    },{threshold: 0.5});
    observer.observe(stats_container);
}

async function loadDetails() {
    //get the id from the url
    const params = new URLSearchParams(window.location.search);
    const pokeId = params.get('id');

    if (!pokeId) {
        window.location.href = 'index.html'; // js tells to the browser that go back if no ID found
        return;
    }

    try {
        //fetch the data for this specific id
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
        const data = await res.json();

        //take the ability form data
        const ability = data.abilities.filter(a => a.is_hidden === false).map(a => a.ability.name);
        
        //fetch species(for category/description)
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();
        const category = speciesData.genera.find(g => g.language.name === "en").genus;

        //fetch types(for weaknesses)
        const weak_strength_res = await fetch(data.types[0].type.url);
        const weak_strength_data = await weak_strength_res.json();
        const weakness = weak_strength_data.damage_relations.double_damage_from;
        const strength = weak_strength_data.damage_relations.double_damage_to;

        //fetch evolution path
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        let evoChain = [];
        let evoDataPath = evoData.chain;

        while(evoDataPath){
            //fetch id from url
            const url_part = evoDataPath.species.url.split('/');
            const id = url_part[url_part.length - 2];

            const res_evo = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data_evo = await res_evo.json();

            evoChain.push({
                name: evoDataPath.species.name,
                id: id,
                types: data_evo.types.map(t => t.type.name)
            });
            evoDataPath = evoDataPath.evolves_to[0];
        }
        //inject into the dom
        renderDetails(data, category, ability, weakness, strength, evoChain);
    } catch (error) {
        console.error("Error fetching details:", error);
    }
}

window.onload = loadDetails;
