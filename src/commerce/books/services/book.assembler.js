import { Book } from '../model/book.entity.js';

export class BookAssembler {
    static toEntityFromResource(resource) {

        return new Book(
            resource.id,
            resource.title,
            resource.description,
            resource.author,
            resource.purchasePrice,
            resource.salePrice,
            resource.stock,
            resource.cover,
            resource.genre,
            resource.language
        );
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(book) {
        return {
            title: book.title,
            description: book.description,
            author: book.author,
            stock: book.stock,
            cover: book.cover,
            genre: book.genre,
            language: book.language
        }
    }

}
