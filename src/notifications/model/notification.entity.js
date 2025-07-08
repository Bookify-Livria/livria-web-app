export class Notification {
    constructor(id, userClientId, createdAt, type, title, content, isRead, isHidden) {
        this.id = id;
        this.userClientId = userClientId;
        this.createdAt = createdAt;
        this.type = type;
        this.title = title;
        this.content = content;
        this.isRead = isRead;
        this.isHidden = isHidden;
    }
}