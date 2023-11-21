// TransactionsTable.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ETHERSCAN_API_KEY = "";
const ADDRESS = "";

async function getTransactions() {
    console.log("ETHERSCAN_API_KEY set:", !!ETHERSCAN_API_KEY);

    const response = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${ADDRESS}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`);
    return response.data.result;
}

async function getHistoricalPrice(date: string) {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date}`);
    return response.data.market_data.current_price.usd;
}

async function getGecko() {
  let data;
  const api_url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=usd";
  async function getData() {
    const response = await fetch(api_url);
    data = await response.json();
    console.log("getGecko ethereum price", data.ethereum.usd);
  }
  getData();
}

async function getTransactionData() {
  const transactions = await getTransactions();
  const transactionData: {
    hash: string;
    shortHash: string;
    date: string;
    gasPrice: string;
    gasUsed: string;
    txCostUSD: number;
    totalCost: number;
  }[] = [];
  let totalCost: number = 0;
  for (const transaction of transactions) {
    const dateObject = new Date(transaction.timeStamp * 1000);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = dateObject.getFullYear();
    const date = `${day}-${month}-${year}`;
    const price_usd = await new Promise<number>((resolve) =>
        setTimeout(() => resolve(getHistoricalPrice(date)), 2000)
    );
    const gasUsed = transaction.gasUsed;
    const gasPrice = transaction.gasPrice;
    const txCostUSD = gasUsed * gasPrice * price_usd / 1e18;
    totalCost += txCostUSD;
    const shortHash = transaction.hash.slice(0, 4) + '...' + transaction.hash.slice(-4);
    console.log(`Transaction ${shortHash} on ${date} cost ${txCostUSD} USD`);
    transactionData.push({
        hash: transaction.hash,
        shortHash,
        date,
        gasPrice: (gasPrice / 1000000000).toString(),
        gasUsed: gasUsed.toString(),
        txCostUSD,
        totalCost
    });
  }
  return transactionData;
}

function TransactionsTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getTransactionData().then(setData);
  }, []);

  return (
    <>
      <h1>{ADDRESS}</h1>
      <table>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>Date</th>
            <th>Gas Price (GWEI)</th>
            <th>Gas Used</th>
            <th>Value in USD</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction, index) => (
            <tr key={index}>
              <td>
                <a
                  href={`https://etherscan.io/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {transaction.shortHash}
                </a>
              </td>

              <td>{transaction.date}</td>
              <td>{transaction.gasPrice}</td>
              <td>{transaction.gasUsed}</td>
              <td>{transaction.txCostUSD}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default TransactionsTable;
