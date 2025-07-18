import axios from 'axios';
import { BookAssembler } from './book.assembler.js';
import authHeader from "../../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class BookApiService {
    getBooks() {
        return axios.get(API_URL + 'books', { headers: authHeader()})
            .then(response => BookAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching books:', error);
                throw error;
            });
    }

    getBookById(Id) {
        return axios.get(API_URL + `books/${Id}`, { headers: authHeader()})
            .then(response => response.data)
            .catch(error => {
                console.error('Error getting book:', error);
                throw error;
            });
    }

    updateStockByBookId(bookId, quantityToAddValue) {
        const requestBody = {
            quantityToAdd: quantityToAddValue
        };
        return axios.put(API_URL + `books/${bookId}/stock`, requestBody, { headers: authHeader()})
            .then(response => response.data)
            .catch(error => {
                console.error(`Error updating stock of book ${bookId}:`, error);
                throw error;
            });
    }

    addNewBook(book) {
        const adapted = BookAssembler.toResource(book);
        return axios.post(API_URL + 'books', adapted, { headers: authHeader()})
            .then(response => BookAssembler.toEntityFromResource(response.data))
            .catch(error => {
                console.error('Error adding book:', error);
                throw error;
            });
    }

}