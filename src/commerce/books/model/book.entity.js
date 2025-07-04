
export class Book {
    constructor(id, title, description, author, purchasePrice, salePrice, stock, cover, genre, language) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.author = author;
        this.purchasePrice = purchasePrice;
        this.salePrice = salePrice;
        this.stock = stock;
        this.cover = cover;
        this.genre = genre;
        this.language = language;
    }
}