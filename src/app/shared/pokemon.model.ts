export class Pokemon {
    id: number;
    name: string;
    sprite: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
    height: number;
    weight: number;
    types: string[];
    abilities: string[];
    moves: string[];
    description: string;
    cryUrlLatest: string;
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.sprite = data.sprite;
        this.back_default = data.back_default;
        this.front_shiny = data.front_shiny;
        this.back_shiny = data.back_shiny;
        this.height = data.height;
        this.weight = data.weight;
        this.types = data.types;
        this.abilities = data.abilities;
        this.moves = data.moves;
        this.description = data.description;
        this.cryUrlLatest = data.cryUrlLatest;
    }
}
