


/*
  DESCRIPTION: Gets multisignature transactions from a list of id-s.

  PARAMETERS:
      - ids: array of transaction ids
*/

SELECT
    "transactionId" AS transaction_id,
    min AS m_min,
    lifetime AS m_lifetime,
    keysgroup AS m_keysgroup
FROM multisignatures
WHERE "transactionId" IN (${ids:csv})
