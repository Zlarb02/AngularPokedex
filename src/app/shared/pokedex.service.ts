import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Pokemon } from './pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokedexService {
  private pokemonsSubject = new BehaviorSubject<Pokemon[]>([]);
  pokemons$ = this.pokemonsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);  // Nouveau BehaviorSubject pour le chargement
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPokemons();
  }

  addPokemon(pokemon: Pokemon): void {
    const currentPokemons = [...this.pokemonsSubject.value, pokemon];
    this.pokemonsSubject.next(currentPokemons);
  }

  getNextPokemonId(): number {
    return this.pokemonsSubject.value.length + 1;
  }

  loadPokemons(): void {
    this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=1000')
      .pipe(
        map(response => response.results),
        mergeMap((pokemonEntries: any[]) => {
          const pokemonDetailsRequests = pokemonEntries.map(pokemon => {
            const id = this.extractIdFromUrl(pokemon.url);
            return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
              .pipe(
                mergeMap(speciesData => {
                  const frenchNameEntry = speciesData.names.find((name: any) => name.language.name === 'fr');
                  const flavorTextEntry = speciesData.flavor_text_entries.find((entry: any) => entry.language.name === 'fr');
                  const cryUrlLatest = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
                  return this.http.get<any>(pokemon.url).pipe(
                    map(pokemonDetails => ({
                      id: pokemonDetails.id,
                      name: frenchNameEntry ? frenchNameEntry.name : pokemonDetails.name,
                      sprite: pokemonDetails.sprites?.front_default,
                      back_default: pokemonDetails.sprites?.back_default,
                      front_shiny: pokemonDetails.sprites?.front_shiny,
                      back_shiny: pokemonDetails.sprites?.back_shiny,
                      height: pokemonDetails.height,
                      weight: pokemonDetails.weight,
                      moves: pokemonDetails.moves.map((move: any) => move.move.name),
                      types: pokemonDetails.types.map((type: any) => type.type.name),
                      abilities: pokemonDetails.abilities.map((ability: any) => ability.ability.name),
                      description: flavorTextEntry ? flavorTextEntry.flavor_text : '',
                      cryUrlLatest: cryUrlLatest
                    }))
                  );
                })
              );
          });
          return forkJoin(pokemonDetailsRequests);
        })
      )
      .subscribe(pokemons => {
        const pokemonInstances = pokemons.map(data => new Pokemon(data));
        this.pokemonsSubject.next(pokemonInstances);
        this.loadingSubject.next(false);  // Mettre à jour l'état du chargement à false
      });
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2], 10);
  }
}
