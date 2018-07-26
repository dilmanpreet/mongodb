"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Item {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    ;
    clone() {
        return new Item(this.name, this.price);
    }
}
exports.Item = Item;
class BbtMenu {
    constructor(storeName) {
        this.storeName = storeName;
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
            new Item("Oolong Tea", 2),];
    }
}
exports.BbtMenu = BbtMenu;
//# sourceMappingURL=bbt.js.map