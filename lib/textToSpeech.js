const express = require('express');
const TTSRouter = express.Router();
const GEO = require('../data/geo.json');
const CATEGORY = require('../data/category.json');
const GEO_CODE_ONLY = Object.keys(GEO);

TTSRouter.get('/speech/lang', function (req, res) {
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

TTSRouter.get('/speech', function (req, res) {
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

module.exports = { TTSRouter };
