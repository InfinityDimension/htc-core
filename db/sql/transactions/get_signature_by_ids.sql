


/*
  DESCRIPTION: Gets signature transactions from a list of id-s.

  PARAMETERS:
      - ids: array of transaction id-s
*/

SELECT
    "transactionId" AS transaction_id,
    encode("publicKey", 'hex') AS "s_publicKey"
FROM signatures
WHERE "transactionId" IN (${ids:csv})
