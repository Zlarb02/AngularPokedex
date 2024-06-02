import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Pokemon } from '../../shared/pokemon.model';
import { PokedexService } from '../../shared/pokedex.service';
import { CommonModule } from '@angular/common';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from '../../components/pokemon-detail/pokemon-detail.component';
import { RouterLink } from '@angular/router';
import { ZoomService } from '../../shared/zoom.service';

@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [CommonModule, PokemonListComponent, PokemonDetailComponent, RouterLink],
  templateUrl: './pokedex-page.component.html',
  styleUrls: ['./pokedex-page.component.css']
})
export class PokedexPageComponent implements OnInit {
  isPokeSelected: boolean = false;
  pokemons!: Pokemon[];
  pokemonDetail!: Pokemon;
  currentIndex: number = 0;
  maxIndex: number = 150;
  isShiny: boolean = false;
  isBack: boolean = false;
  private audioContext!: AudioContext;
  private gainNode!: GainNode;

  @ViewChild('pokeList') pokeList!: ElementRef;
  @ViewChild(PokemonListComponent) pokemonListComponent!: PokemonListComponent;

  constructor(private pokedexService: PokedexService, private zoomService: ZoomService) { }

  ngOnInit(): void {
    this.pokedexService.pokemons$.subscribe(pokemons => {
      this.pokemons = pokemons;
      this.maxIndex = pokemons.length - 1;
    });
  }

  selectPokemon() {
    this.pokemonDetail = this.pokemons[this.currentIndex];
    this.isPokeSelected = true;
  }

  receivePokemon(data: any) {
    if (data instanceof Pokemon) {
      this.pokemonDetail = data;
    }
  }

  scrollTop(): void {
    const pokeListDivScrollable = document.getElementById("pokeList");
    if (pokeListDivScrollable) {
      pokeListDivScrollable.scrollTop += 136;
      if (this.currentIndex < this.maxIndex) {
        this.currentIndex++;
        this.isPokeSelected = false;
        this.isShiny = false;
        this.isBack = false;
      }
    }
  }

  scrollDown(): void {
    const pokeListDivScrollable = document.getElementById("pokeList");
    if (pokeListDivScrollable) {
      pokeListDivScrollable.scrollTop -= 136;
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.isPokeSelected = false;
        this.isShiny = false;
        this.isBack = false;
      }
    }
  }

  scrollAll() {
    const pokeListDivScrollable = document.getElementById("pokeList");
    if (pokeListDivScrollable) {
      if (this.currentIndex === 0) {
        pokeListDivScrollable.scrollTop += 136 * this.maxIndex;
        this.currentIndex = this.maxIndex;
      } else {
        pokeListDivScrollable.scrollTop -= 136 * this.maxIndex;
        this.currentIndex = 0;
      }
      this.isPokeSelected = false;
      this.isShiny = false;
      this.isBack = false;
    }
  }

  playSound() {
    if (!this.pokemonDetail) {
      console.error("No Pokémon selected.");
      return;
    }

    // Initialiser l'AudioContext si ce n'est pas déjà fait
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.AudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.08;
      this.gainNode.connect(this.audioContext.destination);
    }

    // Reprendre l'AudioContext si nécessaire
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => this.playPokemonCry());
    } else {
      this.playPokemonCry();
    }
  }

  shinyToggle() {
    if (!this.pokemonDetail) {
      console.error("No Pokémon selected.");
      return;
    }
    this.isShiny = !this.isShiny
  }

  backToggle() {
    if (!this.pokemonDetail) {
      console.error("No Pokémon selected.");
      return;
    }
    this.isBack = !this.isBack
    console.log(this.isBack)
  }

  private playPokemonCry() {
    if (!this.pokemonDetail.cryUrlLatest) {
      console.error("No cry URL available for the selected Pokémon.");
      return;
    }

    fetch(this.pokemonDetail.cryUrlLatest)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.gainNode);
        source.start();
      })
      .catch(error => console.error("Error playing Pokémon cry:", error));
  }
}
