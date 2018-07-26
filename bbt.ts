export class Item {
    constructor(public name: string, public price: number) { };
    clone() {
        return new Item(this.name, this.price);
    }
}

export class BbtMenu {
    public toppingMenu: Array<Item>;
    public teaMenu: Array<Item>;

    constructor(public storeName: string) {
        this.toppingMenu = [new Item("Pears", 1),
        new Item("Mango stars", 2),
        new Item("Pudding", 1.5),
        new Item("Grass Jelly", 1.25),
        new Item("Coconut Jelly", 2),
        new Item("Fresh Blueberries", 2.5),
        new Item("Fresh Strawberry", 2.5)];

        this.teaMenu = [new Item("Black Tea", 1),
        new Item("Green Tea", 1.5),
        new Item("White Tea", 1.5),
        new Item("Oolong Tea", 2),]
    }
}
    
