export class Review {
    constructor(id, bookId, userId, username, content, stars) {
        this.id = id;
        this.bookId = bookId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.stars = stars;
    }
}