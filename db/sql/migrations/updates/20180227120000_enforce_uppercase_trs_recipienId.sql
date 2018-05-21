


/*
  DESCRIPTION: Change to uppercase all recipient ids existing on table trs
  PARAMETERS: None
*/

UPDATE
  trs
SET
  "recipientId" = UPPER("recipientId")
WHERE
  "recipientId" = LOWER("recipientId");