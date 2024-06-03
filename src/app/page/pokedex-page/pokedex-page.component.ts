import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
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
export class PokedexPageComponent implements OnInit, OnDestroy, AfterViewInit {
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

  @ViewChild('soundBar1') soundBar1!: ElementRef;
  @ViewChild('soundBar2') soundBar2!: ElementRef;
  @ViewChild('soundBar3') soundBar3!: ElementRef;
  @ViewChild('soundBar4') soundBar4!: ElementRef;
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

  ngAfterViewInit(): void {
    this.soundBar4.nativeElement.style.backgroundColor = 'black';
  }

  ngOnDestroy(): void {
    // Clear any existing timeouts when the component is destroyed
    clearTimeout(this.timeout);
    clearTimeout(this.displayTimeout);
  }
  private animSound(): void {
    console.log("anim");
    // Modifiez la couleur des barres de son pour simuler l'effet de capture du son
    this.soundBar4.nativeElement.style.backgroundColor = 'black';

    setTimeout(() => {
      this.soundBar3.nativeElement.style.backgroundColor = 'black';
    }, 100); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar2.nativeElement.style.backgroundColor = 'black';
    }, 200); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar1.nativeElement.style.backgroundColor = 'black';
    }, 300); // Changez le délai selon vos préférences

    // Réinitialisez la couleur des barres de son après un certain délai pour arrêter l'effet de capture du son
    setTimeout(() => {
      this.soundBar1.nativeElement.style.backgroundColor = 'white';
    }, 400); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar2.nativeElement.style.backgroundColor = 'white';
    }, 500); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar1.nativeElement.style.backgroundColor = 'white';
    }, 600); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar2.nativeElement.style.backgroundColor = 'black';
    }, 650); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar1.nativeElement.style.backgroundColor = 'black';
    }, 700); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar1.nativeElement.style.backgroundColor = 'white';
    }, 750); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar2.nativeElement.style.backgroundColor = 'white';
    }, 800); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar3.nativeElement.style.backgroundColor = 'white';
    }, 850); // Changez le délai selon vos préférences

    setTimeout(() => {
      this.soundBar4.nativeElement.style.backgroundColor = 'black';
    }, 900); // Changez le délai selon vos préférences
  }




  scrollToIndex(): void {
    const pokeListDivScrollable = document.getElementById("pokeList");
    if (pokeListDivScrollable && this.inputNumber !== '') {

      pokeListDivScrollable.scrollTop -= (136 * (this.currentIndex + 1));
      pokeListDivScrollable.scrollTop += (136 * (parseInt(this.inputNumber) - 1));
      this.currentIndex = parseInt(this.inputNumber) - 1;
      if (this.currentIndex > this.maxIndex)
        this.currentIndex = this.maxIndex;

      if (this.currentIndex < 0)
        this.currentIndex = 0;
    }
  }

  powerOff(): void {
    this.isPowerOn = false;
    this.isPokeSelected = false;
    this.rightScreenPage = 1;
    this.currentIndex = 0;
    let powerOffSound = document.createElement("audio");
    powerOffSound.src = "../../../assets/on.wav";
    powerOffSound.play();
  }

  powerOn(): void {
    this.isPowerOn = true;
    this.isPokeSelected = false;
    this.rightScreenPage = 1;
    this.currentIndex = 0;
    let powerOnSound = document.createElement("audio");
    powerOnSound.src = "../../../assets/off.wav";
    powerOnSound.play();
  }

  handleClick(event: Event): void {

    let btnSound = document.createElement("audio");
    const soundFiles = [
      "../../../assets/blue1.wav",
      "../../../assets/blue2.wav",
      "../../../assets/blue3.wav",
      "../../../assets/blue4.wav",
      "../../../assets/blue5.wav",
      "../../../assets/blue6.wav",
      "../../../assets/blue7.wav",
      "../../../assets/blue8.wav"
    ];
    // Select a random file from the array
    const randomFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];
    // Set the src attribute of the audio element
    btnSound.src = randomFile;

    let nopeSound = document.createElement("audio");
    nopeSound.src = "../../../assets/green3.wav";

    const target = event.target as HTMLElement;
    this.inputNumberTemp += target.textContent || '';
    this.isInputNumber = true;

    // Clear any existing timeout
    clearTimeout(this.timeout);

    // Set a new timeout
    this.timeout = setTimeout(() => {
      // Display the number after 1.5 seconds
      this.inputNumber = this.inputNumberTemp;

      this.scrollToIndex();
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
      nopeSound.play();
      this.inputNumberTemp = this.inputNumberTemp.slice(0, 4);
    } else {
      btnSound.play();
    }
  }


  selectPokemon(): void {
    this.pokemonDetail = this.pokemons[this.currentIndex];
    this.isPokeSelected = true;
    this.rightScreenPage = 1;
    let selectSound = document.createElement("audio");
    selectSound.src =
      "../../../assets/green2.wav";
    selectSound.play();
  }

  deselectBtn(): void {
    let deselectSound = document.createElement("audio");
    if (this.isPokeSelected)
      deselectSound.src =
        "../../../assets/green1.wav";
    else

      deselectSound.src =
        "../../../assets/green3.wav";
    deselectSound.play();

    this.isPokeSelected = false;
  }

  receivePokemon(data: any): void {
    if (data instanceof Pokemon) {
      this.pokemonDetail = data;
    }
  }

  scrollTop(): void {
    const pokeListDivScrollable = document.getElementById("pokeList");
    let scrollSound = document.createElement("audio");
    if (pokeListDivScrollable) {
      pokeListDivScrollable.scrollTop += 136;
      if (this.currentIndex < this.maxIndex) {
        this.currentIndex++;
        this.isPokeSelected = false;
        this.isShiny = false;
        this.isBack = false;
        scrollSound.src = "../../../assets/tic.wav";
      } else {
        scrollSound.src = "../../../assets/green3.wav";
      }
    }
    scrollSound.play();
  }

  scrollDown(): void {
    const pokeListDivScrollable = document.getElementById("pokeList");
    let scrollSound = document.createElement("audio");
    if (pokeListDivScrollable) {
      pokeListDivScrollable.scrollTop -= 136;
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.isPokeSelected = false;
        this.isShiny = false;
        this.isBack = false;
        scrollSound.src = "../../../assets/tic.wav";
      } else {
        scrollSound.src = "../../../assets/green3.wav";
      }
    }
    scrollSound.play();
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
    let powerOnSound = document.createElement("audio");
    powerOnSound.src = "../../../assets/tic.wav";
    powerOnSound.play();
  }

  playNopeSound(): void {
    let nopeSound = document.createElement("audio");
    nopeSound.src = "../../../assets/green3.wav";
    nopeSound.play();
  }

  playTicSound(): void {
    let ticSound = document.createElement("audio");
    ticSound.src = "../../../assets/tic.wav";
    ticSound.play();
  }
  playBtnSound(): void {
    let btnSound = document.createElement("audio");
    // Create an array with the file paths
    const soundFiles = [
      "../../../assets/blue1.wav",
      "../../../assets/blue2.wav",
      "../../../assets/blue3.wav",
      "../../../assets/blue4.wav",
      "../../../assets/blue5.wav",
      "../../../assets/blue6.wav",
      "../../../assets/blue7.wav",
      "../../../assets/blue8.wav"
    ];
    // Select a random file from the array
    const randomFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];
    // Set the src attribute of the audio element
    btnSound.src = randomFile;
    btnSound.play();
  }

  rightScreenToLeft() {
    let btnSound = document.createElement("audio");
    if (1 < this.rightScreenPage && this.rightScreenPage < 6) {
      this.rightScreenPage--
      btnSound.src = "../../../assets/tic.wav";
    } else {
      btnSound.src = "../../../assets/green3.wav";
    }
    btnSound.play();
  }

  rightScreenToRight() {
    let btnSound = document.createElement("audio");
    if (0 < this.rightScreenPage && this.rightScreenPage < 5) {
      this.rightScreenPage++
      btnSound.src = "../../../assets/tic.wav";
    } else {
      btnSound.src = "../../../assets/green3.wav";
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
      this.animSound();
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
