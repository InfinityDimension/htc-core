


/*
  DESCRIPTION: Gets in-transfer transactions from a list of id-s.

  PARAMETERS:
      - ids: array of transaction id-s
*/

SELECT
    "transactionId" AS transaction_id,
    "dappId" AS in_dappId
FROM intransfer
WHERE "transactionId" IN (${ids:csv})
