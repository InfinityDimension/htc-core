


/*
  DESCRIPTION: Rename port to wsPort in peers table.

  PARAMETERS: None
*/

ALTER TABLE "peers" RENAME COLUMN "port" to "wsPort";
