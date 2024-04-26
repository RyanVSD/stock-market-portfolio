import { Form, FormGroup, Label, Input, Card, Button, CardHeader, CardBody } from 'reactstrap';
import {useState, useEffect} from 'react';

const AWS_API_GATEWAY_ADD_STOCK = 'https://keaoh356y4.execute-api.us-east-1.amazonaws.com/prod/add-stock';

export default function AddStockForm(props) {
    const [ticker, setTicker] = useState("");
    const [shares, setShares] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [addStockError, setAddStockError] = useState(false);
    
    const onChange = function(setFcn) {
        return function(evt) {
            setFcn(evt.currentTarget.value.toUpperCase());
        }
    }
    
    useEffect(() => {
      let isValid = (ticker.length > 0);              // ticker isn't blank
      isValid = isValid && (shares.length > 0);       // shares isn't blank
      isValid = isValid && (purchasePrice.length > 0);// purchasePrice isn't blank
      isValid = isValid && !/[^A-Z]/.test(ticker);    // ticker has letters only
      setIsValid(isValid);
    }, [ticker, shares, purchasePrice]);

    const onSubmit = () => {
        const fetch = require('node-fetch');
        
        const data = {ticker: ticker, shares: shares, purchasePrice: purchasePrice};
        
        const options = {
            method: 'PUT',
            cache: 'default',
            body: JSON.stringify(data)
        };
        
        fetch(AWS_API_GATEWAY_ADD_STOCK, options)
        .then(function(response) {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        })
        .then(response => {
            props.updatePortfolio();
        })
        .catch(function(error) {
            console.log(error);
            setAddStockError(true);
        });
    };
    
    return (
    <Card style={{"margin": "10px"}}>
        <CardHeader>
            Add Stock
        </CardHeader>
        <Form style={{"margin": "10px"}}> 
            <FormGroup>
                <Label for="tickerInput"> 
                Ticker
                </Label>
                <Input 
                    value={ticker} 
                    id="tickerInput" 
                    placeHolder="Ticker"
                    onChange={onChange(setTicker)}
                />
            </FormGroup>

            <FormGroup>
                <Label for="sharesInput"> 
                Shares
                </Label>
                <Input 
                    value={shares}
                    id="sharesInput" 
                    placeHolder="Shares"
                    type="number"
                    onChange={onChange(setShares)}
                />
            </FormGroup>
        
            <FormGroup>
                <Label for="purchaseInput"> 
                Purchase Price
                </Label>
                <Input
                    value={purchasePrice}
                    id="purchaseInput"
                    placeHolder="Purchase Price"
                    type="number"
                    onChange={onChange(setPurchasePrice)}
                />
            </FormGroup>
            
            <Button  onClick={onSubmit} disabled={!isValid}>
                Submit
            </Button>
            
            <Button 
                style={{
                    "backgroundColor": "red",
                    "borderColor":"red",
                    "marginLeft": "20px"
                }}
                onClick={props.exit}
            >
                
            Exit
            </Button>
        </Form>
        {addStockError ? (<CardBody className="add-stock-error">There was an error adding the stock</CardBody>) : (<></>)}
    </Card>
    
    )
}