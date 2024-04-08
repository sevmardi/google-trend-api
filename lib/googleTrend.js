const express = require('express');
const googleTrends = require('google-trends-api');
const GoogleTrendRouter = express.Router();
const CATEGORY = require('../data/category.json');
const RTCATEGORY = require('../data/realtimeCategory.json');
const GEO = require('../data/geo.json');
const GEO_CODE_ONLY = Object.keys(GEO);
const CACHE = require('./cache.js');

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

const validateTime = (query) => {
    const nowDate = new Date();
    if(query?.startTime && new Date(query.startTime) > nowDate ){
        return false
    }
    if(query?.endTime && new Date(query.endTime) > nowDate ){
        return false
    } 
    if(query?.startTime && query?.endTime && (new Date(query.startTime) > new Date(query.endTime))){
        return false;
    }
    return true;
}

const getCached = (form) => {
    try {
        let cacheKey = JSON.stringify(form);
        const cached = CACHE.get(cacheKey);
        // console.log('cachkey' , cacheKey, cached);
        return {cacheKey, cached};
    } catch (err) {
        console.error(err);
    }
    return { cacheKey: failed, cached : null };
}

const returnData = (method, data) => {
    if (data.startsWith('<html')){
        return {
            message: `${method} are not available for this region. Try a different region or use daily trend`
        }
    }
    return JSON.parse(data);
}

const queryValidation = (query, { required, malformed}) => {
    const emptyCheck = (query, key) => {
        const trimmed = query[key].trim().replaceAll("\"", "").replaceAll("\'", "")
        return trimmed.length === 0 ? `${key} is empty` : null;
    }
    const requiredCheck = (query, key) => query.hasOwnProperty(key) ? (emptyCheck(query, key) ? `${key} is empty` : null) : `${key} is required`;
    const errors = required.map( key => {
        if ( errMsg = requiredCheck(query, key) ){
            return errMsg;
        }
    }).filter(Boolean)
    if (errors.length > 0) return { error: errors };
    if (query.geo) {
        const error = emptyCheck(query, 'geo')
        if (error) return { error };
    }
    if (malformed.includes('geo') && !GEO_CODE_ONLY.includes(query.geo)) {
        return { error: 'Invalid GEO code. All geo ref api: `/geo`. ' + ` '${query.geo}' is not in list` };
    }
    if (malformed.includes('category') && query?.category && typeof query.category !== 'string' ) {
        return { error: 'Realtime trends category need to be string. ref api: `/realTimeCategory`' };
    }
    if (malformed.includes('time') && !validateTime(query)){
        return { error: 'Time validate fail'};
    }
} 
GoogleTrendRouter.get('/dailyTrends', async function (req, res) {
    // console.log(req.query);
    const isValid = queryValidation(req.query, {
        required: ['geo'],
        malformed: ['geo']
    });
    if (isValid?.error){
        return res.status(422).json(isValid.error);
    }

    // if ( isNaN(parseInt(req.query.category))) {
    //     return res.status(422).send({ error: 'daily trends category id need to be int. ref api: `/category`' });
    // }
    const form = {
        trendDate: req.query?.date ? new Date(req.query?.date) : new Date(),
        ...(req.query.hasOwnProperty('geo') ? {geo: req.query.geo.toUpperCase()} : {} ),
        ...(req.query.hasOwnProperty('category')
        ? { category: parseInt(req.query.category) }
        : {}),
    };
    // console.log('form', form);
    const {cacheKey, result} = getCached(form);
    if (result){
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }

    try {
        const data = await googleTrends.dailyTrends(form);
        // console.log(data);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Daily Trends ', data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

GoogleTrendRouter.get('/realTimeTrends', async function (req, res) {
    // console.log(req.query);
    const isValid = queryValidation(req.query, {
        required: ['geo'],
        malformed: ['geo', 'category']
    });
    if (isValid?.error){
        return res.status(422).json(isValid.error);
    }

    const form = {
        ...(req.query.hasOwnProperty('geo') ? {geo: req.query.geo.toUpperCase()} : {} ),
        ...(req.query.hasOwnProperty('category') ? { category: req.query.category } : { category: 'all' }),
    };
    // console.log('form', form);
    const {cacheKey, result} = getCached(form);
    if (result){
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }

    try {
        const data = await googleTrends.realTimeTrends(form);
        // console.log('data', data);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Real Time Trends', data));
        }
    } catch (err) {
       res.status(500).send(err);
    }
});

GoogleTrendRouter.get('/interestOverTime', async function (req, res) {
    // TODO: geo is optional of string / array
    const isValid = queryValidation(req.query, {
        required: ['keyword'],
        malformed: ['time']
    });
    if (isValid?.error){
        return res.status(422).json(isValid.error);
    }

    if (req.query.keyword?.keyword){
        req.query.keyword = req.query.keyword.keyword;
    }
    //check keyword can be array
    let keywords = ( typeof req.query.keyword === 'object' && req.query.keyword.length > 0 ? `[${req.query.keyword.join(",")}]` : req.query.keyword.toString()).replace(/'/g, '"');
    try { 
        keywords = JSON.parse(keywords);
    } catch (err) {
        keywords = req.query.keyword;
    }
    const form = { 
        keyword: keywords,
        ...(req.query.hasOwnProperty('geo') ? { geo: req.query.geo.toUpperCase() } : {} ),
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date((req.query.startTime)) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date((req.query.endTime)) } : {} ),
    };
    //  console.log('form1', form);
    //  console.log( keywords );
    const {cacheKey, result} = getCached(form);
    if (result){
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }
    try {
        const data = await googleTrends.interestOverTime(form);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Interest Over Time', data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

GoogleTrendRouter.get('/interestByRegion', async function (req, res) {
    const isValid = queryValidation(req.query, {
        required: ['keyword'],
        malformed: ['time']
    });
    if (isValid?.error) {
        return res.status(422).json(isValid.error);
    }

    // Check if keyword is an array or a single string
    if (req.query.keyword?.keyword) {
        req.query.keyword = req.query.keyword.keyword;
    }
    let keywords = (typeof req.query.keyword === 'object' && req.query.keyword.length > 0 ? `[${req.query.keyword.join(",")}]` : req.query.keyword.toString()).replace(/'/g, '"');
    try {
        keywords = JSON.parse(keywords);
    } catch (err) {
        keywords = req.query.keyword;
    }

    const form = {
        keyword: keywords,
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date(req.query.startTime) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date(req.query.endTime) } : {})
    };

    const { cacheKey, result } = getCached(form);
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }

    try {
        const data = await googleTrends.interestByRegion(form);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Interest By Region', data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

GoogleTrendRouter.get('/relatedQueries', async function (req, res) {
    const isValid = queryValidation(req.query, {
        required: ['keyword'],
        malformed: [req.query?.geo ? 'geo' : null, 'time']
    });
    if (isValid?.error) {
        return res.status(422).json(isValid.error);
    }

    // Check if keyword is an array or a single string
    if (req.query.keyword?.keyword) {
        req.query.keyword = req.query.keyword.keyword;
    }
    let keywords = (typeof req.query.keyword === 'object' && req.query.keyword.length > 0 ? `[${req.query.keyword.join(",")}]` : req.query.keyword.toString()).replace(/'/g, '"');
    try {
        keywords = JSON.parse(keywords);
    } catch (err) {
        keywords = req.query.keyword;
    }

    const form = {
        keyword: keywords,
        ...(req.query.hasOwnProperty('geo') ? { geo: req.query.geo.toUpperCase() } : {}),
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date(req.query.startTime) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date(req.query.endTime) } : {})
    };

    const { cacheKey, result } = getCached(form);
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }

    try {
        const data = await googleTrends.relatedQueries(form);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Related Queries', data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

GoogleTrendRouter.get('/relatedTopics', async function (req, res) {
    const isValid = queryValidation(req.query, {
        required: ['keyword'],
        malformed: [req.query?.geo ? 'geo' : null, 'time']
    });
    if (isValid?.error) {
        return res.status(422).json(isValid.error);
    }

    // Check if keyword is an array or a single string
    if (req.query.keyword?.keyword) {
        req.query.keyword = req.query.keyword.keyword;
    }
    let keywords = (typeof req.query.keyword === 'object' && req.query.keyword.length > 0 ? `[${req.query.keyword.join(",")}]` : req.query.keyword.toString()).replace(/'/g, '"');
    try {
        keywords = JSON.parse(keywords);
    } catch (err) {
        keywords = req.query.keyword;
    }

    const form = {
        keyword: keywords,
        ...(req.query.hasOwnProperty('geo') ? { geo: req.query.geo.toUpperCase() } : {}),
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date(req.query.startTime) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date(req.query.endTime) } : {})
    };

    const { cacheKey, result } = getCached(form);
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }

    try {
        const data = await googleTrends.relatedTopics(form);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Related Topics', data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

GoogleTrendRouter.get('/query', async function (req, res) {
    const isValid = queryValidation(req.query, {
        required: ['keyword'],
        malformed: [ req.query?.geo ? 'geo' : null, 'time']
    });
    if (isValid?.error){
        return res.status(422).json(isValid.error);
    }
    //check keyword can be array
    if (req.query.keyword?.keyword){
        req.query.keyword = req.query.keyword.keyword;
    }
    //check keyword can be array
    let keywords = ( typeof req.query.keyword === 'object' && req.query.keyword.length > 0 ? `[${req.query.keyword.join(",")}]` : req.query.keyword.toString()).replace(/'/g, '"');
    try { 
        keywords = JSON.parse(keywords) 
    } catch (err ){
        keywords = req.query.keyword
    }
    const form = { 
        keyword: keywords,
        ...(req.query.hasOwnProperty('geo') ? {geo: req.query.geo.toUpperCase()} : {} ),
        ...(req.query.hasOwnProperty('category') ? { category: parseInt(req.query.category) } : {}),
        ...(req.query.hasOwnProperty('startTime') ? { startTime: new Date((req.query.startTime)) } : {}),
        ...(req.query.hasOwnProperty('endTime') ? { endTime: new Date((req.query.endTime)) } : {} ),
    };
    const {cacheKey, result} = getCached(form);
    if (result){
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(result));
        return;
    }
    try {
        const data = await googleTrends.relatedQueries(form);
        // console.log(data);
        if (data) {
            CACHE.set(cacheKey, JSON.stringify(data));
            res.setHeader('Content-Type', 'application/json');
            res.json(returnData('Query', data));
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
module.exports = { GoogleTrendRouter };
