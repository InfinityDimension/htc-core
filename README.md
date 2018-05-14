# Htc

**NOTE:** The following information is applicable to: **Ubuntu 14.04, 16.04 (LTS) or 16.10 - x86_64**.

## Prerequisites - In order

- Tool chain components -- Used for compiling dependencies

  `sudo apt-get install -y python build-essential curl automake autoconf libtool`

- Git

  `sudo apt-get install -y git`

- Node.js (<https://nodejs.org/>) -- Node.js serves as the underlying engine for code execution.

  System wide via package manager:

  ```
  curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

  Locally using [nvm](https://github.com/creationix/nvm):

  ```
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
  nvm install v6.10.1
  ```

- Install PostgreSQL (version 9.6.2):

  ```
sudo apt-get install -y postgresql postgresql-contrib libpq-dev
sudo -u postgres createuser --createdb $USER
createdb htc_test
sudo -u postgres psql -d htc_test -c "alter user "$USER" with password 'password';"
  ```
