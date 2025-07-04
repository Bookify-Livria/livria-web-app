import { Book } from '../model/book.entity.js';
import { Review } from '../model/review.entity.js';

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
            id: book.id,
            title: book.title,
            description: book.description,
            author: book.author,
            purchasePrice: book.purchasePrice,
            salePrice: book.salePrice,
            stock: book.stock,
            cover: book.cover,
            genre: book.genre,
            language: book.language
        }
    }

}
