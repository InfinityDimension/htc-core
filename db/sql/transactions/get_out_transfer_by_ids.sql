


/*
  DESCRIPTION: Gets out-transfer transactions from a list of id-s.

  PARAMETERS:
      - ids: array of transaction id-s
*/

SELECT
    "transactionId" AS transaction_id,
    "dappId" AS "ot_dappId",
    "outTransactionId" AS "ot_outTransactionId"
FROM outtransfer
WHERE "transactionId" IN (${ids:csv})
