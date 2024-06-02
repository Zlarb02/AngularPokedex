import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Pokemon } from '../../shared/pokemon.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ZoomService } from '../../shared/zoom.service';
import { PokedexService } from '../../shared/pokedex.service';

@Component({
  selector: 'app-create-pokemon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-pokemon.component.html',
  styleUrls: ['./create-pokemon.component.css']
})
export class CreatePokemonComponent {
  pokemonForm: FormGroup;
  isFormSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private zoomService: ZoomService,
    private pokedexService: PokedexService

  ) {
    this.pokemonForm = this.fb.group({
      name: ['', Validators.required],
      image: ['', [Validators.required, this.urlValidator]],
      description: ['', Validators.required]
    });
  }

  urlValidator(control: FormControl): { [key: string]: boolean } | null {
    const urlPattern = /^(https?:\/\/).*\.(png|jpg|jpeg|gif|bmp)$/i;
    if (!control.value.match(urlPattern)) {
      return { invalidUrl: true };
    }
    return null;
  }

  resetForm(): void {
    this.isFormSubmitted = false;
    this.pokemonForm.reset();
  }

  onSubmit(): void {
    if (this.pokemonForm.valid) {
      const { name, image, description } = this.pokemonForm.value;
      const randomdId = Math.floor(Math.random() * 151) + 1;
      const newPokemon: Pokemon = {
        id: this.pokedexService.getNextPokemonId(),
        name: name,
        sprite: image,
        back_default: image,
        front_shiny: image,
        back_shiny: image,
        height: 0,
        weight: 0,
        moves: [],
        types: [],
        abilities: [],
        description: description,
        cryUrlLatest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${randomdId}.ogg`
      };
      this.pokedexService.addPokemon(newPokemon);
      console.log('Form submitted', newPokemon);
      this.isFormSubmitted = true;

    } else {
      console.log('Form is invalid');
    }
  }
}
