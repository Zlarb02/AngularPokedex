import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, from } from 'rxjs';
import { Pokemon } from './pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokedexService {
  private pokemonsSubject = new BehaviorSubject<Pokemon[]>([]);
  pokemons$ = this.pokemonsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadPokemons();
  }

  addPokemon(pokemon: Pokemon): void {
    const currentPokemons = [...this.pokemonsSubject.value, pokemon];
    this.pokemonsSubject.next(currentPokemons);
  }

  getNextPokemonId(): number {
    return this.pokemonsSubject.value.length + 1;
  }

  async loadPokemons(): Promise<void> {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await response.json();
      const pokemonEntries = data.results;

      from(pokemonEntries).pipe(
        concatMap(async (pokemon: any) => {
          const id = this.extractIdFromUrl(pokemon.url);
          const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
          const speciesData = await speciesResponse.json();

          const frenchNameEntry = speciesData.names.find((name: any) => name.language.name === 'fr');
          const flavorTextEntry = speciesData.flavor_text_entries.find((entry: any) => entry.language.name === 'fr');
          const cryUrlLatest = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

          const pokemonResponse = await fetch(pokemon.url);
          const pokemonDetails = await pokemonResponse.json();

          const abilityPromises = pokemonDetails.abilities.map(async (ability: any) => {
            try {
              const abilityResponse = await fetch(`https://pokeapi.co/api/v2/ability/${ability.ability.name}/`);
              const abilityData = await abilityResponse.json();
              const frenchAbilityNameEntry = abilityData.names.find((name: any) => name.language.name === 'fr');
              return frenchAbilityNameEntry ? frenchAbilityNameEntry.name : ability.ability.name;
            } catch {
              return 'Unknown Ability';
            }
          });

          const typePromises = pokemonDetails.types.map(async (type: any) => {
            try {
              const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type.type.name}/`);
              const typeData = await typeResponse.json();
              const frenchTypeNameEntry = typeData.names.find((name: any) => name.language.name === 'fr');
              return frenchTypeNameEntry ? frenchTypeNameEntry.name : type.type.name;
            } catch {
              return 'Unknown Type';
            }
          });

          const abilities = await Promise.all(abilityPromises);
          const types = await Promise.all(typePromises);

          return {
            id: pokemonDetails.id,
            name: frenchNameEntry ? frenchNameEntry.name : pokemonDetails.name,
            sprite: pokemonDetails.sprites?.front_default,
            back_default: pokemonDetails.sprites?.back_default,
            front_shiny: pokemonDetails.sprites?.front_shiny,
            back_shiny: pokemonDetails.sprites?.back_shiny,
            height: parseFloat((pokemonDetails.height * 0.1).toFixed(2)),
            weight: parseFloat((pokemonDetails.weight * 0.1).toFixed(2)),
            types: types,
            abilities: abilities,
            description: flavorTextEntry ? flavorTextEntry.flavor_text : "Pokemon mystérieux.",
            cryUrlLatest: cryUrlLatest
          };
        })
      ).subscribe({
        next: (pokemon) => {
          this.pokemonsSubject.next([...this.pokemonsSubject.value, new Pokemon(pokemon)]);
        },
        complete: () => {
          this.loadingSubject.next(false);
        },
        error: (err) => {
          console.error('Error loading Pokémon data', err);
          this.loadingSubject.next(false);
        }
      });
    } catch (error) {
      console.error('Error loading Pokémon data', error);
      this.loadingSubject.next(false);
    }
  }


  private extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2], 10);
  }
}
