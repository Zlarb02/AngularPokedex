import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pokemon } from '../../shared/pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent {
  @Input() pokemons!: Pokemon[];
  @Input() isShiny!: boolean;
  @Input() isBack!: boolean;
  @Output() pokemonSelected: EventEmitter<Pokemon> = new EventEmitter<Pokemon>();

  constructor() { }

  onElementSelected(pokemon: Pokemon) {
    this.pokemonSelected.emit(pokemon);
    console.log(pokemon);
  }
}
