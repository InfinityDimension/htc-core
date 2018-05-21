/*
  DESCRIPTION: Gets delegate transactions by from a list of id-s.

  PARAMETERS:
      - ids: array of transaction id-s
*/

SELECT "transactionId" AS transaction_id, username AS d_username
FROM delegates
WHERE "transactionId" IN (${ids:csv})
