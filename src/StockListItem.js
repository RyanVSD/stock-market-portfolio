import utilities from './utilities';
import { FaDeleteLeft } from "react-icons/fa6";

function StockListItem(props) {
  
  const { stock } = props;
  const purchaseValueStr = utilities.formatNumber(stock.purchaseValue);
  const currentValueStr = utilities.formatNumber(stock.currentValue);
  
  const purchasePriceStr = utilities.formatNumber(stock.purchasePrice);
  const currentPriceStr = utilities.formatNumber(stock.currentPrice);
  
  const profitStr = utilities.formatNumber(stock.profit);
  const profitClass = stock.profit < 0 ? 'loss' : 'profit';
  
  const AWS_API_GATEWAY_DELETE_STOCK = "https://keaoh356y4.execute-api.us-east-1.amazonaws.com/prod/delete-stock";
  
  const deleteStock = (evt) => {
    let ticker = evt.currentTarget.getAttribute('data-ticker')
    console.log(ticker);
    const fetch = require('node-fetch');
  
    const data = {"ticker": ticker}
    
    const options = {
      method: 'POST',
      cache: 'default',
      body: JSON.stringify(data)
    };
    
    
    return fetch(AWS_API_GATEWAY_DELETE_STOCK, options)
      .then(function(response) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      })
      .then(function(response) {
        props.updatePortfolio();
      })
      .catch(function(error) {
        console.log(error);
      })
    }
  
  return (
    <tr>
      <td>{stock.ticker}</td>
      <td>{stock.name != null ? stock.name : "N/A :("}</td>
      <td>{stock.shares}</td>
      <td className="money">{purchasePriceStr}</td>
      <td className="money">{purchaseValueStr}</td>
      <td className="money">{currentPriceStr}</td>
      <td className="money">{currentValueStr}</td>
      <td className={"money "+profitClass}>{profitStr}</td>
      <td>
        <div onClick={deleteStock} data-ticker={stock.ticker}>
          <FaDeleteLeft style={{"color": "red"}}/>
        </div>
      </td>
    </tr>
  );
}

export default StockListItem;
