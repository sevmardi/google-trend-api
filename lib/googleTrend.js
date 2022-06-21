const express = require('express');
const googleTrends = require('google-trends-api');
const GoogleTrendRouter = express.Router();
const CATEGORY = require('../data/category.json');
const RTCATEGORY = require('../data/realtimeCategory.json');
const GEO = require('../data/geo.json');
const GEO_CODE_ONLY = Object.keys(GEO);

GoogleTrendRouter.get('/', function (req, res) {
    return res.send('gt hello');
});

GoogleTrendRouter.get('/category', function (req, res) { // daily 
    return res.json(CATEGORY);
});

GoogleTrendRouter.get('/realTimeCategory', function (req, res) {
    return res.json(RTCATEGORY);
  });

GoogleTrendRouter.get('/geo', function (req, res) {
    return res.json(GEO);
});

GoogleTrendRouter.get('/dailyTrends', async function (req, res) {
    // console.log(req.query);
    if (!GEO_CODE_ONLY.includes(req.query?.geo)) {
        return res.status(422).send({ error: 'Invalid GEO code. All geo ref api: `/geo`' });
    }
    // if ( isNaN(parseInt(req.query.category))) {
    //     return res.status(422).send({ error: 'daily trends category id need to be int. ref api: `/category`' });
    // }
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

GoogleTrendRouter.get('/realTimeTrends', async function (req, res) {
    // console.log(req.query);
    if (!GEO_CODE_ONLY.includes(req.query?.geo)) {
        return res.status(422).send({ error: 'Invalid GEO code. All geo ref api: `/geo`' });
    }
    if ( req.query?.category && typeof req.query.category !== 'string' ) {
        return res.status(422).send({ error: 'Realtime trends category need to be string. ref api: `/realTimeCategory`' });
    }
    const form = {
        geo: req.query?.geo || 'US',
        ...(req.query.hasOwnProperty('category')
        ? { category: req.query.category }
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

GoogleTrendRouter.get('/interestOverTime', async function (req, res) {
    // console.log(req.query);
    if (req.query.hasOwnProperty('geo') && !GEO_CODE_ONLY.includes(req.query?.geo)) {
        return res.status(422).send({ error: 'Invalid GEO code. All geo ref api: `/geo`' });
    }
    if (!req.query.hasOwnProperty('keyword')) {
        return res.status(422).send({ error: 'Keyword is required' });
    }

    const form = { 
        geo: req.query?.geo || 'US',
        keyword: req.query.keyword,
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date((req.query.startTime)) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date((req.query.endTime)) } : {} ),
    };
    //   console.log('form', form);
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

GoogleTrendRouter.get('/query', async function (req, res) {
    if (!req.query.hasOwnProperty('keyword')) {
        return res.status(422).send({ error: 'Keyword is required' });
    }
    const form = { 
        geo: req.query?.geo || 'US',
        keyword: req.query.keyword,
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date((req.query.startTime)) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date((req.query.endTime)) } : {} ),
    };
    try {
        const data = await googleTrends.relatedQueries(form);
        // console.log(data);
        if (data) {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
module.exports = { GoogleTrendRouter };
