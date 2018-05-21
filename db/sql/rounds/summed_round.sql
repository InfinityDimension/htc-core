


/*
  DESCRIPTION: ?

  PARAMETERS:
  	$1 - activeDelegates - Number of active delegates
  	$2 - round - Round number
*/

SELECT sum(r.fee)::bigint AS fees, array_agg(r.reward) AS rewards, array_agg(r.pk) AS delegates
FROM (SELECT b."totalFee" AS fee, b.reward, encode(b."generatorPublicKey", 'hex') AS pk FROM blocks b
WHERE ceil(b.height / ${activeDelegates}::float)::int = ${round}
ORDER BY b.height ASC) r
