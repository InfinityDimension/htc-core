


/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

INSERT INTO mem_round SELECT * FROM mem_round_snapshot;

DROP TABLE IF EXISTS mem_round_snapshot;
