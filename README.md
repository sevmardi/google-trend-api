# rapid-google-trend-api

https://rapidapi.com/kelvin2go/api/google-trend-api/

## get geo code
```
var options = {
  method: 'GET',
  url: 'https://google-trend-api.p.rapidapi.com/interestOverTime',
  params: {keyword: 'Valentine', geo: 'US'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': 'noj7gDdwGBmshIvNBsaZG8QGggTxp1LsDx5jsnJkCM4SOUg8qU'
  }
};
```

## get trend category

```
var options = {
  method: 'GET',
  url: 'https://google-trend-api.p.rapidapi.com/category',
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': 'noj7gDdwGBmshIvNBsaZG8QGggTxp1LsDx5jsnJkCM4SOUg8qU'
  }
};
```

## get Daily Trends
```
var options = {
  method: 'GET',
  url: 'https://google-trend-api.p.rapidapi.com/dailyTrends',
  params: {date: '2021-10-20', geo: 'US', category: '316'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': 'noj7gDdwGBmshIvNBsaZG8QGggTxp1LsDx5jsnJkCM4SOUg8qU'
  }
};
```
## get Real Time Trends
```
var options = {
  method: 'GET',
  url: 'https://google-trend-api.p.rapidapi.com/realTimeTrends',
  params: {geo: 'US'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': 'noj7gDdwGBmshIvNBsaZG8QGggTxp1LsDx5jsnJkCM4SOUg8qU'
  }
};
```
## get Interest Over Time
```
var options = {
  method: 'GET',
  url: 'https://google-trend-api.p.rapidapi.com/interestOverTime',
  params: {keyword: 'Valentine', geo: 'US'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': 'noj7gDdwGBmshIvNBsaZG8QGggTxp1LsDx5jsnJkCM4SOUg8qU'
  }
};
```
