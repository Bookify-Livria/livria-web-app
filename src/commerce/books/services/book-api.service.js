import axios from 'axios';
import { BookAssembler } from './book.assembler.js';

export class BookApiService {
    getBooks() {
        return axios.get('https://app-250621192653.azurewebsites.net/api/v1/books')
            .then(response => BookAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching books:', error);
                throw error;
            });
    }

    updateBook(book) {
        return axios.put(`https://app-250621192653.azurewebsites.net/api/v1/books/${book.id}`, book)
            .catch(error => {
                console.error('Error updating book:', error);
                throw error;
            });
    }

    updateStockByBookId(bookId, newStockValue) {
        return axios.patch(`https://app-250621192653.azurewebsites.net/api/v1/books/${bookId}`, {
            stock: newStockValue
        })
            .then(response => response.data)
            .catch(error => {
                console.error(`Error updating stock of book ${bookId}:`, error);
                throw error;
            });
    }

    addNewBook(book) {
        const adapted = BookAssembler.toResource(book);
        return axios.post('https://app-250621192653.azurewebsites.net/api/v1/books/books', adapted)
            .catch(error => {
                console.error('Error adding book:', error);
                throw error;
            });
    }

}