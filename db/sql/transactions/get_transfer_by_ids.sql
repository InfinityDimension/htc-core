


/*
  DESCRIPTION: Gets transfer transactions from a list of id-s.

  PARAMETERS:
      ids - array of transaction id-s
*/

SELECT
    "transactionId" AS transaction_id,
    convert_from(data, 'utf8') AS tf_data
FROM transfer
WHERE "transactionId" IN (${ids:csv})
