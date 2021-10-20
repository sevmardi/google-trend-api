const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const googleTrendRouter = express.Router();
const googleTrends = require('google-trends-api');

const GEO = require('./data/geo.json');
const GEO_CODE_ONLY = Object.keys(GEO);
const CATEGORY = require('./data/category.json');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

googleTrendRouter.get('/', function (req, res) {
  return res.send('gt hello');
});

googleTrendRouter.get('/category', function (req, res) {
  return res.json(CATEGORY);
});

googleTrendRouter.get('/geo', function (req, res) {
  return res.json(GEO);
});

googleTrendRouter.get('/dailytrends', async function (req, res) {
  console.log(req.query);
  if (!GEO_CODE_ONLY.includes(req.query?.geo)) {
    res.status(422).send({ error: 'Invalid GEO code' });
  }
  const form = {
    trendDate: req.query?.date ? new Date(req.query?.date) : new Date(),
    geo: req.query?.geo || 'US',
    ...(req.query.hasOwnProperty('category')
      ? { category: parseInt(req.query.category) }
      : {}),
  };
  // console.log('form', form);
  try {
    const data = await googleTrends.dailyTrends(form);
    // console.log(data);
    if (data) {
      res.setHeader('Content-Type', 'application/json');
      res.json(JSON.parse(data));
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

googleTrendRouter.get('/realTimeTrends', async function (req, res) {
  console.log(req.query);
  if (!GEO_CODE_ONLY.includes(req.query?.geo)) {
    res.status(422).send({ error: 'Invalid GEO code' });
  }
  const form = {
    geo: req.query?.geo || 'US',
    ...(req.query.hasOwnProperty('category')
      ? { category: parseInt(req.query.category) }
      : { category: 'all' }),
  };
  // console.log('form', form);
  try {
    const data = await googleTrends.realTimeTrends(form);
    // console.log(data);
    if (data) {
      res.setHeader('Content-Type', 'application/json');
      res.json(JSON.parse(data));
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

googleTrendRouter.get('/interestOverTime', async function (req, res) {
  console.log(req.query);
  if (
    req.query.hasOwnProperty('geo') &&
    !GEO_CODE_ONLY.includes(req.query?.geo)
  ) {
    res.status(422).send({ error: 'Invalid GEO code' });
  }
  if (!req.query.hasOwnProperty('keyword')) {
    res.status(422).send({ error: 'Missing keyword' });
  }

  const form = {
    geo: req.query?.geo || 'US',
    keyword: req.query.keyword,
    ...(req.query.hasOwnProperty('category')
      ? { category: parseInt(req.query.category) }
      : {}),
    ...(req.query.hasOwnProperty('startTime')
      ? { startTime: parseInt(req.query.startTime) }
      : {}),
    ...(req.query.hasOwnProperty('endTime')
      ? { endTime: parseInt(req.query.endTime) }
      : {}),
  };
  console.log('form', form);
  try {
    const data = await googleTrends.interestOverTime(form);
    // console.log(data);
    if (data) {
      res.setHeader('Content-Type', 'application/json');
      res.json(JSON.parse(data));
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.use('/gt', googleTrendRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
