


/*
  DESCRIPTION: Gets vote transactions by from a list of id-s.

  PARAMETERS:
      - ids: array of transaction id-s
*/

SELECT
    "transactionId" AS transaction_id,
    votes AS v_votes
FROM votes
WHERE "transactionId" IN (${ids:csv})
