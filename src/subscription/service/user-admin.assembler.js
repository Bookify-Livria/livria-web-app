import { UserAdmin } from '../model/user-admin.entity.js';

export class UserAdminAssembler {
    static toEntityFromResource(resource) {
        return new UserAdmin(
            resource.id,
            resource.display,
            resource.username,
            resource.email,
            resource.password,
            resource.adminAccess,
            resource.securityPin,
            resource.capital,
        );
    }
}