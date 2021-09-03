# Installing

## npm

```sh
npm install git+ssh://git@github.com:ReroInc/partylens-permissions.git
```

## yarn

```sh
yarn add git+ssh://git@github.com:ReroInc/partylens-permissions.git
```

# Basic usage

Each exported object has proper documentation attached to it, that an IDE should normally display (simple JS comments).

This interface should never change in pratice, even if the internals will probably.

```javascript

import { MPBit, addPermissions, removePermissions, hasPermissions } from 'partylens-permission';

const baseperms = MPBit.ITEM_EDIT | MPBit.MEMBER_INVITE | MPBit.ITEM_INCREMENT;

let updatedPerms = removePermissions(baseperms, MPBit.ITEM_EDIT);

if (!hasPermissions(updatedPerms, MPBit.MEMBER_KICK)) {
	updatedPerms = addPermissions(updatedPerms, MPBit.MEMBER_KICK);
}
```
