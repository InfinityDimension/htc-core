


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

SELECT height, id, "previousBlock", "timestamp"
FROM blocks
WHERE id = $1
