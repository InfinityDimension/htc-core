


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

DELETE FROM ${table:name}
WHERE "accountId" = ${address}
  AND "dependentId" = ${dependentId}
