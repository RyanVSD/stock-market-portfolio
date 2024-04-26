import { useState, useEffect } from 'react';
import './App.css';
import { Card, CardHeader, CardBody, CardFooter, Button } from 'reactstrap';
import StockList from './StockList';
import AddStockForm from "./AddStockForm.js";

const AWS_API_GATEWAY = 'https://keaoh356y4.execute-api.us-east-1.amazonaws.com/prod';
const AWS_API_GATEWAY_GET_PORTFOLIO = AWS_API_GATEWAY + '/get-portfolio';
const AWS_API_GATEWAY_GET_STOCK_PRICE = AWS_API_GATEWAY + '/get-stock-price';
const AWS_API_GATEWAY_GET_STOCK_NAME = AWS_API_GATEWAY + '/get-stock-name';
  
function createTickerList(stocks) {
  return stocks.map(stock => {
      return stock.ticker;
  });
}

function getStockPrice(ticker) {
  const fetch = require("node-fetch");
    
  const data = {"ticker": ticker}
  
  const options = {
    method: 'POST',
    cache: 'default',
    body: JSON.stringify(data)
  };
  
  
  return fetch(AWS_API_GATEWAY_GET_STOCK_PRICE, options)
    .then(function(response) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(function(response) {
     return response.data.ask[0];
    })
    .catch(function(error) {
      console.log(error);
    })
}

function getStockName(ticker) {
  const fetch = require('node-fetch');
  
  const data = {"ticker": ticker}
  
  const options = {
    method: 'POST',
    cache: 'default',
    body: JSON.stringify(data)
  };
  
  
  return fetch(AWS_API_GATEWAY_GET_STOCK_NAME, options)
    .then(function(response) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(function(response) {
      //console.log("GOT NAME: " + response.data.Name)
      if(response.data.Name === undefined) {
        console.log(response);
      }
      return response.data.Name;
    })
    .catch(function(error) {
      console.log(error);
    })
}

const getPortfolio = () => {
    console.log("GET PORT")
    const fetch = require("node-fetch");
     const options = {
      method: 'POST',
      cache: 'default'
    };
    
    return fetch(AWS_API_GATEWAY_GET_PORTFOLIO, options)
      .then(function(response) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(function(response) {
        //console.log(response);
        let formatted = [];
        response.Items.forEach((item) => {
          let obj = {
            'ticker': item.ticker.S,
            "shares": parseInt(item.shares.N),
            "purchasePrice": parseInt(item.purchasePrice.N)
          };
          formatted.push(obj);
        });
        return(formatted);
      })
      .catch(function(error) {
        console.log(error);
      })
  }

function App() {
  // Uncomment setMyName if required, for example, if the name
  // is stored in the DynamoDB
  const [myName/*, setMyName*/] = useState('Ryan');
  const [stocks, setStocks] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [tickerList, setTickerList] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  
  // Retrieve the current stock information when the page first loads
  useEffect(() => {
   // console.log("GETTING PORTFOLIO")
   getPortfolio().then(response => {
    setStocks(response); 
   });
  }, []);
  
  // With the stock data add purchase value, current price
  // and current value to the stock record
  useEffect(() => {
    // console.log("CREATING TICKERLIST")
    setTickerList(createTickerList(stocks));
    setShowAddStockForm(false);
  }, [stocks])
  
  useEffect(() => {
    //console.log("UPD PRICES")
    // Make list of promise groups containing a promise.all of the 
    // name and price API calls for each ticker and the ticker name
    let promises = tickerList.reduce((acc, ticker) => {
      acc.push(Promise.all([getStockPrice(ticker), getStockName(ticker), ticker])
        .then((response) => {
          return response 
        }));
      return acc;
    }, []);
    // Once all promise groups complete 
    Promise.all(promises)
      // Reduce to obj
      .then(stocks => {
        const prices = stocks.reduce((obj, stock) => {
          const info = {
            price: stock[0],
            name: stock[1]
          }
          obj[stock[2]] = info;
          return obj;
        }, {});
        console.log(prices);
        setStockPrices(prices);
      })
  }, [tickerList])
  
  useEffect(() => {
    // console.log("UPD PORTLIST");
    let data = stocks.reduce((acc, stock) => {
      let info = {
        ticker: stock.ticker,
        name: stockPrices[stock.ticker]?.name,
        shares: stock.shares,
        purchasePrice: stock.purchasePrice,
        purchaseValue: stock.shares * stock.purchasePrice,
        currentPrice: stockPrices[stock.ticker]?.price,
        currentValue: stock.shares * stockPrices[stock.ticker]?.price,
        profit: stock.shares * stockPrices[stock.ticker]?.price - stock.shares * stock.purchasePrice
      }
      acc.push(info);
      return acc;
    }, []);
    setPortfolioData(data);
  }, [stocks, stockPrices])
  
  const addStock = evt => {
    setShowAddStockForm(value => !value);
  }
  if(showAddStockForm) {
    return <AddStockForm 
      exit={() => {setShowAddStockForm(!showAddStockForm)}}
      updatePortfolio={() => {
                  getPortfolio()
                    .then(response => {
                      setStocks(response); 
                    });
              }}
    />
  } else {
    return (
      <div className="App d-flex align-items-center justify-content-center">
        <Card>
          <CardHeader className="card-header-color">
            <h4>{myName}'s Stock Portfolio</h4>
          </CardHeader>
          <CardBody>
            <StockList 
              updatePortfolio={() => {
                  getPortfolio()
                    .then(response => {
                      setStocks(response); 
                    });
              }} 
              data={portfolioData}
            />
          </CardBody>
          <CardFooter>
            <Button size="sm" onClick={addStock}>Add stock</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
}

export default App;

