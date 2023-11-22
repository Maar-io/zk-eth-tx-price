// TransactionsTable.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";


const ADDRESS = "";

async function getTransactions() {
  const response = await axios.get(
    `https://zkatana.blockscout.com/api/v2/addresses/0xC779CEB0853fa7AB6a38c587c1CFC702e4603d9B/transactions?filter=to%20%7C%20from`
  );
  console.log("response", response.data.items);
  return response.data.items;
}

async function getHistoricalPrice(date: string) {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date}`
  );
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
interface TransactionData {
  hash: string;
  shortHash: string;
  date: string;
  gasPrice: string;
  gasUsed: string;
  txCostUSD: number;
  totalCost: number;
}

async function getTransactionData(
  updateData: (data: TransactionData) => void
): Promise<void> {
  const transactions = await getTransactions();
  let totalCost: number = 0;
  transactions.forEach(async (transaction) => {

    const dateObject = new Date(transaction.timestamp);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = dateObject.getFullYear();
    const date = `${day}-${month}-${year}`;
    // const price_usd = await new Promise<number>((resolve) =>
    //   setTimeout(() => resolve(getHistoricalPrice(date)), 2000)
    // );
    const price_usd = 2000;
    const gasUsed = transaction.gas_used;
    const gasPrice = transaction.gas_price;
    const txCostUSD = (gasUsed * gasPrice * price_usd) / 1e18;
    totalCost += txCostUSD;
    const shortHash =
      transaction.hash.slice(0, 6) + "..." + transaction.hash.slice(-4);
    console.log(`Transaction ${shortHash} on ${date} cost ${txCostUSD} USD`);
    const transactionData = {
      hash: transaction.hash,
      shortHash,
      date,
      gasPrice: (gasPrice / 1000000000).toString(),
      gasUsed,
      txCostUSD,
      totalCost,
    };
    updateData(transactionData);
  });
  //   return transactionData;
}

function TransactionsTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getTransactionData((transactionData) => {
      setData((prevData) => [...prevData, transactionData]);
    });
  }, []);

  return (
    <>
      <h1>{ADDRESS}</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
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
                <td>{index + 1}</td>

              <td>
                <a
                  href={`https://zkatana.blockscout.com//tx/${transaction.hash}`}
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
