import { Routes } from '@angular/router';
import { PokedexPageComponent } from './page/pokedex-page/pokedex-page.component';
import { CreatePokemonComponent } from './page/create-pokemon/create-pokemon.component';

export const routes: Routes = [
    {
        path: '',
        component: PokedexPageComponent
    },
    {
        path: 'create',
        component: CreatePokemonComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];
