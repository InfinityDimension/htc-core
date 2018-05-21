


/*
  DESCRIPTION: Insert rewards for round to round rewards table.

  PARAMETERS: timestamp - Timestamp of last block of round
              fees - Fees amount for particular block
              reward - Rewards amount for particular block
              round - Round number
              publicKey - Public key of a delegate that forged a block
*/

INSERT INTO rounds_rewards (
	"timestamp",
	"fees",
	"reward",
	"round",
	"publicKey"
) VALUES (
	${timestamp},
	${fees}::bigint,
	${reward}::bigint,
	${round},
	DECODE(${publicKey}, 'hex')
)
