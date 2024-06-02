import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Pokemon } from '../../shared/pokemon.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ZoomService } from '../../shared/zoom.service';
import { PokedexService } from '../../shared/pokedex.service';
import { Observable, forkJoin, map, pluck } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-create-pokemon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './create-pokemon.component.html',
  styleUrls: ['./create-pokemon.component.css']
})
export class CreatePokemonComponent {
  pokemonForm: FormGroup;
  isFormSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private zoomService: ZoomService,
    private pokedexService: PokedexService,
    private http: HttpClient  // Ajoutez ceci

  ) {
    this.pokemonForm = this.fb.group({
      name: ['', Validators.required],
      image: ['', [Validators.required, this.urlValidator]],
      description: ['', Validators.required]
    });
  }

  urlValidator(control: FormControl): { [key: string]: boolean } | null {
    const urlPattern = /^(https?:\/\/).*\.(png|jpg|jpeg|gif|bmp)$/i;
    if (control.value && !control.value.match(urlPattern)) {
      return { invalidUrl: true };
    }
    return null;
  }

  resetForm(): void {
    this.isFormSubmitted = false;
    this.pokemonForm.reset();
  }

  getRandomPokemonDetail(): Observable<any> {
    const randomId = Math.floor(Math.random() * 1000);
    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      .pipe(
        map((pokemonDetails: Pokemon) => ({
          height: pokemonDetails.height,
          weight: pokemonDetails.weight,
          moves: pokemonDetails.moves.map((move: any) => move.move.name),
          types: pokemonDetails.types.map((type: any) => type.type.name),
          abilities: pokemonDetails.abilities.map((ability: any) => ability.ability.name),
        }))
      );
  }

  onSubmit(): void {
    if (this.pokemonForm.valid) {
      const { name, image, description } = this.pokemonForm.value;
      const randomId = Math.floor(Math.random() * 1000);
      forkJoin({
        details: this.getRandomPokemonDetail()
      }).subscribe(({ details }) => {
        const newPokemon: Pokemon = {
          id: this.pokedexService.getNextPokemonId(),
          name: name,
          sprite: image,
          back_default: undefined,
          front_shiny: undefined,
          back_shiny: undefined,
          height: details.height,
          weight: details.weight,
          moves: details.moves,
          types: details.types,
          abilities: details.abilities,
          description: description,
          cryUrlLatest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${randomId}.ogg`
        };
        this.pokedexService.addPokemon(newPokemon);
      });
    }
  }


}