# caritas

## Prerequisites

- Tool chain components -- Used for compiling dependencies

  `sudo apt-get install -y python build-essential curl automake autoconf libtool libtool-bin`

- Git (<https://github.com/git/git>) -- Used for cloning and updating caritas

  `sudo apt-get install -y git`

- Node.js

  Locally using [nvm](https://github.com/creationix/nvm):

  ```
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
  nvm install v6.10.1
  ```

- Install PostgreSQL (version 9.6.2):

  ```
  sudo apt-get install -y postgresql postgresql-contrib libpq-dev
  sudo -u postgres createuser --createdb $USER
  createdb caritas_test
  sudo -u postgres psql -d caritas_test -c "alter user "$USER" with password 'password';"
  ```

- Bower (<http://bower.io/>) -- Bower helps to install required JavaScript dependencies.

  `npm install -g bower`

- Grunt.js (<http://gruntjs.com/>) -- Grunt is used to compile the frontend code and serves other functions.

  `npm install -g grunt-cli`

- PM2 (<https://github.com/Unitech/pm2>) -- PM2 manages the node process for Lisk (Optional)

  `npm install -g pm2`

## Installation Steps

Clone the Lisk repository using Git and initialize the modules.

```
git clone https://github.com/CaritasChain/caritas.git
cd caritas
npm install
```

Load git submodules

```
git submodule init
git submodule update
```

Build the user-interface:

```
cd public
npm install
bower install --allow-root
grunt release
```

## start

`node app.js`
