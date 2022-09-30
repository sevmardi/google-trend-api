

## get geo code
```
var options = {
  method: 'GET',
  url: '/interestOverTime',
  params: {keyword: 'Valentine', geo: 'US'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': '{key}'
  }
};
```

## get trend category

```
var options = {
  method: 'GET',
  url: '/category',
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': '{key}'
  }
};
```

## get Daily Trends
```
var options = {
  method: 'GET',
  url: '/dailyTrends',
  params: {date: '2021-10-20', geo: 'US', category: '316'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': '{key}'
  }
};
```
## get Real Time Trends
```
var options = {
  method: 'GET',
  url: '/realTimeTrends',
  params: {geo: 'US'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': '{key}'
  }
};
```
## get Interest Over Time
```
var options = {
  method: 'GET',
  url: '/interestOverTime',
  params: {keyword: 'Valentine', geo: 'US'},
  headers: {
    'x-rapidapi-host': 'google-trend-api.p.rapidapi.com',
    'x-rapidapi-key': '{key}'
  }
};
```
