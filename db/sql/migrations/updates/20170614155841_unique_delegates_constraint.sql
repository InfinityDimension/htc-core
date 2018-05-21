


/*
  DESCRIPTION: Setting unique constraints on delegates table.

  PARAMETERS: None
*/

ALTER TABLE delegates ADD CONSTRAINT delegates_unique UNIQUE ("username", "transactionId");
