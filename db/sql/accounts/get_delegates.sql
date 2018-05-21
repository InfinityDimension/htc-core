


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

SELECT encode("publicKey", 'hex') AS "publicKey"
FROM mem_accounts
WHERE "isDelegate" = 1
