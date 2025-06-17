export class Book {
<<<<<<< Updated upstream
    constructor(id, title, description, author, price, cover, genre, language) {
=======
    constructor(id, title, description, author, price, stock, cover, genre, language, reviews = []) {
>>>>>>> Stashed changes
        this.id = id;
        this.title = title;
        this.description = description;
        this.author = author;
        this.price = price;
        this.stock = stock;
        this.cover = cover;
        this.genre = genre;
        this.language = language;
    }
}