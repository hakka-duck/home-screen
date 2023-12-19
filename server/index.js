const { Client } = require('pg');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

const client = new Client({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE ||'database',
  user: process.env.PG_USER || 'user',
  password: process.env.PG_PASSWORD || 'password'
})

client.connect();

async function initHomeScreen() {
  const result = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'open_homescreens');`);
  const { exists } = result.rows[0];
  if (!exists) {
    await client.query(`
      CREATE TABLE open_homescreens (
        id serial PRIMARY KEY,
        title text NOT NULL,
        description text,
        image text,
        icon text,
        url text NOT NULL,
        target text NULL,
        deleted boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  }
}

initHomeScreen();

app.set('view engine', 'ejs');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/icons', express.static(__dirname + '/node_modules/@material-design-icons/font/'));

app.get('/', async (req, res) => {
  const result = await client.query('SELECT * FROM open_homescreens;')
  res.render('index', {
    title: '服務入口',
    Homescreens: result.rows
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});