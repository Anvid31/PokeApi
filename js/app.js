document.addEventListener('DOMContentLoaded', async () => {
    const pokemonContainer = document.getElementById('pokemon');
    const searchInput = document.getElementById('search');
    const filterMoveInput = document.getElementById('movementFilter');
    const filterTypeInput = document.getElementById('typeFilter');
    const addPokemonForm  = document.getElementById('newPokemonForm');
    const addFormBtn  = document.getElementById('addFormBtn');
    const pokemonFormModal = new bootstrap.Modal(document.getElementById('pokemonFormModal'), {});
    let pokeList = [];
    let pokeEdit = null;



// --------  Mostrar Formulario -------- //

addFormBtn.addEventListener('click', () => {
    pokeEdit = null;
    addPokemonForm.reset();
    document.getElementById('pokemonFormModalLabel').textContent = 'Agregar Pokémon';
    pokemonFormBody();
    pokemonFormModal.show();
});


// ----- Crear el cuerpo del Formulario ---- //

function pokemonFormBody(pokemon = null){

    const selectType = document.getElementById('newPokemonTypes');
    const selectMove = document.getElementById('newPokemonMoves');

    newPokemonTypes.innerHTML = '';
    newPokemonMoves.innerHTML = '';


    Promise.all([
        fetch('https://pokeapi.co/api/v2/type').then(res => res.json()),
        fetch('https://pokeapi.co/api/v2/move').then(res => res.json())
    ]).then(([typesData, movesData]) => {

        typesData.results.forEach(type => {
            const newOptions = document.createElement('option');
            newOptions.value = type.name;
            newOptions.textContent = type.name;     

            if (pokemon && pokemon.types.some(pokemonType => pokemonType.type.name === type.name)) {
                newOptions.selected = true;
            }

            selectType.appendChild(newOptions);
        });

        movesData.results.slice(0, 50).forEach(move => {
            const newOptions = document.createElement('option');
            newOptions.value = move.name;
            newOptions.textContent = move.name;

            if (pokemon && pokemon.moves.some(pokemonMove => pokemonMove.move.name === move.name)) {
                newOptions.selected = true;
            }

            selectMove.appendChild(newOptions);
        });
    });
}


// ----- Tomar los datos y guardarlos ----- //


addPokemonForm.addEventListener('submit', (event) => {
    event.preventDefault;
    const pokemonName = document.getElementById('newPokemonName').value;
    const pokemonId = parseInt(document.getElementById('newPokemonId').value);
    const pokemonUrl = document.getElementById('newPokemonImage').value;
    const pokemonType = Array.from(document.getElementById('newPokemonTypes').selectedOptions).map(Option => ({ type  :{ name:  option.value}}));
    const pokemonMove = Array.from(document.getElementById('newPokemonMoves').selectedOptions).map(Option => ({ move  :{ name:  option.value}}));
    const newPokemon = {pokemonName, pokemonId, sprites: { front_default: pokemonUrl }, pokemonType, pokemonMove };

    if (pokeEdit) {
        const index = pokeList.findIndex(pokemon => pokemon.id === pokeEdit.id);
        pokeList[index] = newPokemon;
    } else {
        pokeList.push(newPokemon);
    }

    showPokemons(pokeList);
    pokemonFormModal.hide();

})


// ---- Crear Pokemon ----- //

newPokemonForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPokemonName = document.getElementById('newPokemonName').value;
    const newPokemonId = document.getElementById('newPokemonId').value;
    const newPokemonImage = document.getElementById('newPokemonImage').value;

    const newPokemon = {
        name: newPokemonName.toLowerCase(),
        id: parseInt(newPokemonId),
        sprites: { front_default: newPokemonImage },
        moves: [],
        types: []
    };

// ----- Agregar el nuevo Pokémon a la lista ------ //

    pokeList.push(newPokemon);

// ------- Guardar el nuevo Pokémon en el localStorage ------ //

    const customPokemons = loadFromLocalStorage();
    customPokemons.push(newPokemon);
    saveToLocalStorage(customPokemons);

    showPokemons(pokeList);

    newPokemonForm.reset();

});

// ------ Traer Todos los Pokemons a la PokeApi ------- //

    fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=151')
        .then(response => response.json())
        .then(data => {
            const fetches = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            return Promise.all(fetches);
        })
        .then(pokemons => {
            pokeList = pokemons;
            showPokemons(pokeList);
        });


// ----- Crea las Tarjetas ---- // 

    function createPokemonCard(pokemon) {
        const card = `
            <div class="box">
                <img src=${pokemon.sprites.front_default} class="img" width=195px height=285px;>
                <strong class="title">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</strong>
                <p class="number"> Numero :  ${pokemon.id}</p>
                <button onclick="location.href='../views/more.html?id=${pokemon.id}'" class="Btn">Saber Más</button>
                <button onclick="deletePokemon()" class="Btn2">Eliminar</button>
            </div>
        `;
        return card;
    }

// ----- Mostrar los Pokemones en las Cards ------ //

    function showPokemons(pokeList) {
        pokemonContainer.innerHTML = '';
        pokeList.forEach(pokemon => {
            pokemonContainer.innerHTML += createPokemonCard(pokemon);
        });
    }


// ------ Filtrado y Muestreo en Tiempo Real ------- // 

    function pokemonShowTime() {
        const searchValue = searchInput.value.toLowerCase();
        const moveValue = filterMoveInput.value.toLowerCase();
        const typeValue = filterTypeInput.value.toLowerCase();

        const FilterwithPokemons = pokeList.filter(pokemon => {
            const matchesName = pokemon.name.toLowerCase().includes(searchValue);
            const matchesMove = moveValue ? pokemon.moves.some(move => move.move.name.toLowerCase().includes(moveValue)) : true;
            const matchesType = typeValue ? pokemon.types.some(type => type.type.name.toLowerCase().includes(typeValue)) : true;
            return matchesName && matchesMove && matchesType;
        });

        showPokemons(FilterwithPokemons);
    }



// ----- Sistema de Sorteos ------ // 


    window.sortAZ = () => {
        const sortedPokemons = [...pokeList].sort((a, b) => a.name.localeCompare(b.name));
        showPokemons(sortedPokemons);
    };

    window.sortZA = () => {
        const sortedPokemons = [...pokeList].sort((a, b) => b.name.localeCompare(a.name));
        showPokemons(sortedPokemons);
    };

    window.sortById = () => {
        const sortedPokemons = [...pokeList].sort((a, b) => a.id - b.id);
        showPokemons(sortedPokemons);
    };

    window.sortByIdDesc = () => {
        const sortedPokemons = [...pokeList].sort((a, b) => b.id - a.id);
        showPokemons(sortedPokemons);
    };

    searchInput.addEventListener('input', () => {
        pokemonShowTime();
    });

    filterMoveInput.addEventListener('input', () => {
        pokemonShowTime();
    });

    filterTypeInput.addEventListener('input', () => {
        pokemonShowTime();
    });


    window.deletePokemon = () => {
        if (confirm('¿Estás seguro de que deseas eliminar este Pokémon?')) {
            pokeList = pokeList.filter(p => p.id != pokemonId);
            saveToLocalStorage(pokeList);
            alert('Pokémon eliminado correctamente');
            document.location = './index.html';
        }
    };




});
