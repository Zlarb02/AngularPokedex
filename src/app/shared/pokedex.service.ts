import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
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
        concatMap((pokemonEntries: any[]) => { // Remplacer mergeMap par concatMap
          const pokemonDetailsRequests = pokemonEntries.map(pokemon => {
            const id = this.extractIdFromUrl(pokemon.url);
            return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
              .pipe(
                concatMap(speciesData => { // Remplacer mergeMap par concatMap
                  const frenchNameEntry = speciesData.names.find((name: any) => name.language.name === 'fr');
                  const flavorTextEntry = speciesData.flavor_text_entries.find((entry: any) => entry.language.name === 'fr');
                  const cryUrlLatest = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
                  return this.http.get<any>(pokemon.url).pipe(
                    concatMap(pokemonDetails => { // Remplacer mergeMap par concatMap
                      const abilityRequests = pokemonDetails.abilities.map((ability: any) => {
                        return this.http.get<any>(`https://pokeapi.co/api/v2/ability/${ability.ability.name}/`).pipe(
                          map(abilityData => {
                            const frenchAbilityNameEntry = abilityData.names.find((name: any) => name.language.name === 'fr');
                            return frenchAbilityNameEntry ? frenchAbilityNameEntry.name : ability.ability.name;
                          })
                        );
                      });
                      const typeRequests = pokemonDetails.types.map((type: any) => {
                        return this.http.get<any>(`https://pokeapi.co/api/v2/type/${type.type.name}/`).pipe(
                          map(typeData => {
                            const frenchTypeNameEntry = typeData.names.find((name: any) => name.language.name === 'fr');
                            return frenchTypeNameEntry ? frenchTypeNameEntry.name : type.type.name;
                          })
                        );
                      });
                      return forkJoin([...abilityRequests, ...typeRequests]).pipe(
                        map(results => {
                          const abilities = results.slice(0, abilityRequests.length);
                          const types = results.slice(abilityRequests.length, abilityRequests.length + typeRequests.length);
                          const moves = results.slice(abilityRequests.length + typeRequests.length);
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
                      );
                    })
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
