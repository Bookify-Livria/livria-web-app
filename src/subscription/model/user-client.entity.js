import { User } from "./user.entity.js";

export class UserClient extends User {
    constructor(id, display, username, email, password, icon, phrase, subscription) {
        super(id, display, username, email, password);

        //own attributes
        this.icon = icon;
        this.phrase = phrase;
        this.subscription = subscription;
    }
}