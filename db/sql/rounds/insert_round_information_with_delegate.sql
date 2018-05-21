


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

INSERT INTO mem_round
	("address", "amount", "delegate", "round")
SELECT
	${address}, (${balanceMode:raw}balance)::bigint, ${delegate}, ${round}
	FROM mem_accounts
	WHERE address = ${address}
