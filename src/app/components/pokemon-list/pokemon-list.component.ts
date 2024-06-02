import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { PokedexService } from '../../shared/pokedex.service'; // Import du service
import { Pokemon } from '../../shared/pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit {
  @Input() pokemons!: Pokemon[];
  @Input() isShiny!: boolean;
  @Input() isBack!: boolean;
  @Output() pokemonSelected: EventEmitter<Pokemon> = new EventEmitter<Pokemon>();

  loading: boolean = true;  // Nouvelle propriété pour le chargement

  constructor(private pokedexService: PokedexService) { }

  ngOnInit(): void {
    this.pokedexService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  onElementSelected(pokemon: Pokemon) {
    this.pokemonSelected.emit(pokemon);
    console.log(pokemon);
  }
}
