/*
 ** Partylens permission (pure JavaScript, to allow compatibility with the React frontend)
 **
 ** Written by Aurélien Brabant
*/

/**
 * Member Permission Bit "enumeration"
 *
 * Due to javascript number limitations, a maximum of 32 different permissions are able to be encoded
 * on a single number.
 *
 * For now, let's consider it is enough.
 */

export const MPBit = {
	NONE: 0,
	MEMBER_INVITE: 1 << 0,
	MEMBER_GROUP_INVITE: 1 << 1,
	MEMBER_KICK: 1 << 2,
	CHAT_WR: 1 << 3,
	CHAT_RD: 1 << 4,
	ITEM_CREATE: 1 << 5,
	ITEM_INCREMENT: 1 << 6,
	ITEM_DELETE: 1 << 7,
	ITEM_EDIT: 1 << 8,
	METADATA_EDIT: 1 << 9,
	GRANT_PRIVILEGES: 1 << 10,
};

/**
 * @description utility function to help detect invalid arguments passed to permissions functions.
 *
 * @param {any} bits should normally be a number, but this function deals with the fact that in JS everything is considered to be of
 * type any by default. A `typeof` check is performed, and an error is thrown in case bits is not an argument of type number.
 *
 * @return {void} nothing is returned, an error will interrupt the standard program's control flow if the type is invalid.
 */

const permission_typecheck = (bits) =>
{
	if (typeof bits !== 'number') {
		throw new Error(`Permission bits must be a number, received a(n) ${typeof bits}`);
	}
}

/**
 * @param {number} currentPermissionBits
 * @param {number} expectedPermissionBits must be a subset of currentPermissionBits, otherwise permission is denied.
 *
 * @return {boolean} true if expected is a subset of actual, true otherwise.
 *
 * @example hasPermissions(member.permissionBits, MPBit.METADATA_EDIT | MPBit.MEMBER_GROUP_INVITE);
 * In this example, we're checking if METADATA_EDIT and MEMBER_GROUP_INVITE permissions are set in a single
 * function call, using the bitwise or ( | ) javascript operator.
 */

export const hasPermissions = (currentPermissionBits, expectedPermissionBits) =>
{
	permission_typecheck(currentPermissionBits); permission_typecheck(expectedPermissionBits);

	return (currentPermissionBits & expectedPermissionBits >= expectedPermissionBits);
}

/**
 * @param {number} currentPermissionBits
 * @param {number} removedPermissionBits
 *
 * @return {number} A new number representing permission bits, but without removedPermissionBits.
 *
 * @example const updatedPermBits = removePermissions(member.permissionBits, MEMBER_GROUP_INVITE);
 * In this example, the MEMBER_GROUP_INVITE permission is REMOVED. Bitwise OR operator can be used
 * to combine many permissions together.
 */

export const removePermissions = (currentPermissionBits, removedPermissionBits) =>
{
	permission_typecheck(currentPermissionBits); permission_typecheck(removedPermissionBits);

	return (currentPermissionBits & (~removedPermissionBits));
}

/**
 * @param {number} currentPermissionBits
 * @param {number} addedPermissionBits
 *
 * @return {number} A new number representing permission bits, but with addedPermissionBits added.
 *
 * @example const updatedPermBits = addPermissions(member.permissionBits, MEMBER_GROUP_INVITE);
 * In this example, the MEMBER_GROUP_INVITE permission is ADDED. Bitwise OR operator can be used
 * to combine many permissions together.
 */

export const addPermissions = (currentPermissionBits, addedPermissionBits) =>
{
	permission_typecheck(currentPermissionBits); permission_typecheck(addedPermissionBits);

	return (currentPermissionBits | addedPermissionBits);
}
