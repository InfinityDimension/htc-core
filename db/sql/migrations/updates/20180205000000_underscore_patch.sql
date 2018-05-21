


/*
  DESCRIPTION: Patches any existing database that contains migration names in camel case,
               and changes them into low-case underscore.

  PARAMETERS: None
*/

UPDATE migrations SET name = lower(regexp_replace(name, E'([A-Z])', E'\_\\1','g'))
