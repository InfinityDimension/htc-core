


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

INSERT INTO mem_round
	("address", "amount", "delegate", "round")
SELECT
	${address}, (${amount})::bigint, "dependentId", ${round}
	FROM mem_accounts2delegates
	WHERE "accountId" = ${address}
