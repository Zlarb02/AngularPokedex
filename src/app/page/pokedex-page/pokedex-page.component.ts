import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
export class PokedexPageComponent implements OnInit, OnDestroy {
  isPowerOn: boolean = true;

  loading: boolean = true;

  isPokeSelected: boolean = false;
  pokemons!: Pokemon[];
  pokemonDetail!: Pokemon;
  currentIndex: number = 0;
  maxIndex: number = 150;
  isShiny: boolean = false;
  isBack: boolean = false;
  private audioContext!: AudioContext;
  private gainNode!: GainNode;

  inputNumberTemp = '';
  timeout: any;
  inputNumber = '';
  isInputNumber: boolean = false;
  displayTimeout: any;


  @ViewChild('pokeList') pokeList!: ElementRef;
  @ViewChild(PokemonListComponent) pokemonListComponent!: PokemonListComponent;
  rightScreenPage: number = 1;


  constructor(private pokedexService: PokedexService, private zoomService: ZoomService) { }

  ngOnInit(): void {
    this.pokedexService.pokemons$.subscribe(pokemons => {
      this.pokemons = pokemons;
      this.maxIndex = pokemons.length - 1;
    });
    this.pokedexService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnDestroy(): void {
    // Clear any existing timeouts when the component is destroyed
    clearTimeout(this.timeout);
    clearTimeout(this.displayTimeout);
  }

  powerOff(): void {
    this.isPowerOn = false;
    this.isPokeSelected = false;
    this.rightScreenPage = 1;
    this.currentIndex = 0;
  }

  powerOn(): void {
    this.isPowerOn = true;
    this.isPokeSelected = false;
    this.rightScreenPage = 1;
    this.currentIndex = 0;
  }

  handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    this.inputNumberTemp += target.textContent || '';
    this.isInputNumber = true;

    // Clear any existing timeout
    clearTimeout(this.timeout);

    // Set a new timeout
    this.timeout = setTimeout(() => {
      // Display the number after 1.5 seconds
      this.inputNumber = this.inputNumberTemp;

      // Reset inputNumberTemp
      this.inputNumberTemp = '';

      // Clear inputNumber after 2 seconds
      this.displayTimeout = setTimeout(() => {
        this.inputNumber = '';

        this.isInputNumber = false;
      }, 500);
    }, 2000);

    // Optionally limit to 4 digits
    if (this.inputNumberTemp.length > 4) {
      this.inputNumberTemp = this.inputNumberTemp.slice(0, 4);
    }
  }


  selectPokemon(): void {
    this.pokemonDetail = this.pokemons[this.currentIndex];
    this.isPokeSelected = true;
    this.rightScreenPage = 1;
  }

  receivePokemon(data: any): void {
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

  scrollAll(): void {
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

  rightScreenToLeft() {
    if (1 < this.rightScreenPage && this.rightScreenPage < 6) {
      this.rightScreenPage--
    }
  }

  rightScreenToRight() {
    if (0 < this.rightScreenPage && this.rightScreenPage < 5) {
      this.rightScreenPage++
    }
  }

  playSound(): void {
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

  shinyToggle(): void {
    if (!this.pokemonDetail) {
      console.error("No Pokémon selected.");
      return;
    }
    this.isShiny = !this.isShiny
  }

  backToggle(): void {
    if (!this.pokemonDetail) {
      console.error("No Pokémon selected.");
      return;
    }
    this.isBack = !this.isBack
    console.log(this.isBack)
  }

  private playPokemonCry(): void {
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
