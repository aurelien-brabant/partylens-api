declare module 'partylens-permissions' {
	export function hasPermissions(currentPermissions: number, expectedPermissions: number): boolean;
	export function addPermissions(currentPermissions: number, addedPermissions: number): number;
	export function removePermissions(currentPermissions: number, addedPermissions: number): number;

 	export const MPBit: {
		NONE: 0;
		MEMBER_INVITE: 1;
		MEMBER_GROUP_INVITE: 2,
		MEMBER_KICK: 4,
		CHAT_WR: 8,
		CHAT_RD: 16,
		ITEM_CREATE: 32,
		ITEM_INCREMENT: 64,
		ITEM_DELETE: 128,
		ITEM_EDIT: 256,
		METADATA_EDIT: 512,
		GRANT_PRIVILEGES: 1024,
	}
}
