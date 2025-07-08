export class Review {
    constructor(id, bookId, userClientId, username, content, stars) {
        this.id = id;
        this.bookId = bookId;
        this.userClientId = userClientId;
        this.username = username;
        this.content = content;
        this.stars = stars;
    }
}