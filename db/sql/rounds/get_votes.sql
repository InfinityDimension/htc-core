


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

SELECT
	delegate,
	sum(amount) AS amount
FROM mem_round
WHERE round = ${round}::bigint
GROUP BY delegate
