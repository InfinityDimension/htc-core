


/*
  DESCRIPTION: Add Height Column to Peers.

  PARAMETERS: None
*/

ALTER TABLE "peers" ADD COLUMN IF NOT EXISTS "height" INT;

CREATE INDEX IF NOT EXISTS "peers_height" ON "peers"("height");
