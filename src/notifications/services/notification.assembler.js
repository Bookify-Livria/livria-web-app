import { Notification } from "../model/notification.entity.js"

export class NotificationAssembler {
    static toEntityFromResource(resource) {
        return new Notification(
            resource.id,
            resource.userClientId,
            resource.createdAt,
            resource.type,
            resource.title,
            resource.content,
            resource.isRead,
            resource.isHidden,
        );
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(notification) {
        return {
            userClientId: notification.userClientId,
            type: notification.type,
            createdAt: notification.createdAt,
        };
    }
}
