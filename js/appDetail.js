document.addEventListener('DOMContentLoaded', async () => {
    const pokemonContainer = document.getElementById('PokemonInfo');
    const pokemonImage = document.getElementById('pokeImage');
    const url = new URLSearchParams(window.location.search);
    const pokemonId = url.get('id');
    const editPokemonForm = document.getElementById('editPokemonForm');
    const editpokemonFormBtn = document.getElementById('editarBtn');
    let pokeList = loadFromLocalStorage();
    let = pokeEdit = null;

// ------ Traer Todos los Pokemons a la PokeApi ------- //

    async function fetchPokemon(id) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemon = await response.json();
            const imagen = pokemon.sprites.other['official-artwork'].front_default;
            showPokemonDetail(pokemon, imagen);
        } catch (error) {
            console.error('Error al buscar el Pokémon:', error);
        }
    }

// ----- Crea las Tarjetas ---- // 


    function showPokemonDetail(pokemon, imagen) {
        pokemonContainer.innerHTML = `
            <h1 class="card__title">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
            <h1 class="card__description"> Posicion N°: ${pokemon.id}</h1>
            <h1 class="card__description">${pokemon.types.map(type => type.type.name).join(', ')}</h1>
            <h1 class="card__description">${pokemon.abilities.map(abilities => abilities.ability.name).join(', ')}</h1>
        `;

        pokemonImage.innerHTML = `<img src="${imagen || pokemon.sprites.front_default}" alt="${pokemon.name}">`;
    }



    if (pokemonId) {
        const customPokemon = pokeList.find(p => p.id == pokemonId);
        if (customPokemon) {
            showPokemonDetail(customPokemon, customPokemon.sprites.front_default);
        } else {
            await fetchPokemon(pokemonId);
        }
    } else {
        pokemonContainer.innerHTML = '<p>No hay información disponible</p>';
    }

    function loadFromLocalStorage() {
        const customPokemons = localStorage.getItem('customPokemons');
        return customPokemons ? JSON.parse(customPokemons) : [];
    }

    function saveToLocalStorage(pokemons) {
        localStorage.setItem('customPokemons', JSON.stringify(pokemons));
    }


    
    editpokemonFormBtn.addEventListener('click', () => {
        pokeEdit = null;
        editPokemonForm.reset();
        document.getElementById('pokemonFormModalLabel').textContent = 'Editar Pokémon';
        pokemonFormBody();
        pokemonFormModal.show();
    });


    window.showEditForm = () => {
        const pokemon = pokeList.find(p => p.id == pokemonId);
        if (pokemon) {
            document.getElementById('editPokemonId').value = pokemon.id;
            document.getElementById('editPokemonName').value = pokemon.name;
            document.getElementById('editPokemonImage').value = pokemon.sprites.front_default || pokemon.image;
            editPokemonForm.style.display = 'block';
        }
    };

    editPokemonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editPokemonId').value;
        const editedPokemonName = document.getElementById('editPokemonName').value;
        const editedPokemonImage = document.getElementById('editPokemonImage').value;

        const editedPokemon = {
            id: parseInt(id),
            name: editedPokemonName.toLowerCase(),
            sprites: { front_default: editedPokemonImage },
            moves: [],
            types: []
        };

        const index = pokeList.findIndex(p => p.id == id);
        if (index !== -1) {
            pokeList[index] = editedPokemon;
        } else {
            pokeList.push(editedPokemon);
        }

        saveToLocalStorage(pokeList);
        editPokemonForm.reset();
        editPokemonForm.style.display = 'none';
        pokemonFormModal.hide();
        alert('Pokémon editado correctamente');
    });

    });
