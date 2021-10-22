const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const googleTrendRouter = express.Router();
const googleTrends = require('google-trends-api');

const ttsRouter = express.Router();

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

googleTrendRouter.get('/dailyTrends', async function (req, res) {
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

ttsRouter.get('/speech/lang', function (req, res) {
  const LANGUAGES = {
    af: 'Afrikaans',
    sq: 'Albanian',
    ar: 'Arabic',
    hy: 'Armenian',
    ca: 'Catalan',
    zh: 'Chinese',
    'zh-cn': 'Chinese (Mandarin/China)',
    'zh-tw': 'Chinese (Mandarin/Taiwan)',
    'zh-yue': 'Chinese (Cantonese)',
    hr: 'Croatian',
    cs: 'Czech',
    da: 'Danish',
    nl: 'Dutch',
    en: 'English',
    'en-au': 'English (Australia)',
    'en-uk': 'English (United Kingdom)',
    'en-us': 'English (United States)',
    eo: 'Esperanto',
    fi: 'Finnish',
    fr: 'French',
    de: 'German',
    el: 'Greek',
    ht: 'Haitian Creole',
    hi: 'Hindi',
    hu: 'Hungarian',
    is: 'Icelandic',
    id: 'Indonesian',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    la: 'Latin',
    lv: 'Latvian',
    mk: 'Macedonian',
    no: 'Norwegian',
    pl: 'Polish',
    pt: 'Portuguese',
    'pt-br': 'Portuguese (Brazil)',
    ro: 'Romanian',
    ru: 'Russian',
    sr: 'Serbian',
    sk: 'Slovak',
    es: 'Spanish',
    'es-es': 'Spanish (Spain)',
    'es-us': 'Spanish (United States)',
    sw: 'Swahili',
    sv: 'Swedish',
    ta: 'Tamil',
    th: 'Thai',
    tr: 'Turkish',
    vi: 'Vietnamese',
    cy: 'Welsh',
  };
  return res.json(LANGUAGES);
});

// ** tts ** //

ttsRouter.get('/speech', function (req, res) {
  if (!req.query.hasOwnProperty('text')) {
    res.status(422).send({ error: 'Missing text' });
  }
  const form = {
    lang: req.query?.lang || 'en-us',
    text: req.query.text,
  };

  var gtts = require('node-gtts')(form.lang);
  res.set({ 'Content-Type': 'audio/mpeg' });
  gtts.stream(form.text).pipe(res);
});
app.use('/tts', ttsRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
