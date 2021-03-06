


/*
  DESCRIPTION: Counts duplicate delegates by transactionId.

  PARAMETERS: None
*/

WITH duplicates AS
  (
    SELECT count(*)
    FROM delegates
    GROUP BY "transactionId"
    HAVING count(*) > 1
  )
SELECT count(*)
FROM duplicates
