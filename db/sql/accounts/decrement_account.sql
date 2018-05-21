


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

UPDATE ${table:name}
SET ${field:name} = ${field:name} - ${value}::bigint
WHERE address = ${address}
