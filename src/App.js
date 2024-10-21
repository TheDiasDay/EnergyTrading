import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Battery, Zap, User, LogOut, Wallet } from 'lucide-react';
import { ethers } from 'ethers';

const contractABI = [[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			}
		],
		"name": "buyEnergy",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "listingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "EnergyListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "listingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "EnergySold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "listEnergy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "listingCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "listings",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
];

const contractAddress = "0xf202ad99339cacffB7bdE517392f1B8214c37e6B";

// Simulated data generation function
const generateEnergyData = () => {
  return [...Array(24)].map((_, i) => ({
    time: `${i}:00`,
    production: Math.random() * 10,
    consumption: Math.random() * 8,
    price: Math.random() * 0.5 + 0.1,
  }));
};

// MetaMask Authentication Component
const MetaMaskAuth = ({ onAuthSuccess }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToMetaMask = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        onAuthSuccess(account);
      } else {
        alert('MetaMask is not installed!');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect to MetaMask');
    }
    setIsConnecting(false);
  };

  return (
    <button 
      onClick={connectToMetaMask} 
      disabled={isConnecting}
      className="bg-orange-500 text-white px-4 py-2 rounded"
    >
      {isConnecting ? 'Connecting...' : 'Connect to MetaMask'}
    </button>
  );
};

// Main Dashboard Component
const MainDashboard = ({ account, username, onLogout }) => {
  const [energyData] = useState(generateEnergyData());
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [contract, setContract] = useState(null);
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({ amount: '', price: '', energyType: '' });

  useEffect(() => {
    const initializeEthers = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const energyContract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(energyContract);

      const fetchBalanceAndListings = async () => {
        const balance = await provider.getBalance(account);
        setWalletBalance(ethers.formatEther(balance));

        const listingCount = await energyContract.getListingCount();
        const fetchedListings = [];
        for (let i = 0; i < listingCount; i++) {
          const listing = await energyContract.getListing(i);
          fetchedListings.push({
            id: i,
            seller: listing[0],
            amount: listing[1].toString(),
            price: ethers.formatEther(listing[2]),
            energyType: listing[3],
            isActive: listing[4]
          });
        }
        setListings(fetchedListings);
      };

      fetchBalanceAndListings();
    };

    initializeEthers();
  }, [account]);

  const handleListEnergy = async () => {
    if (!contract) return;
    try {
      const tx = await contract.listEnergy(
        ethers.parseEther(newListing.amount),
        ethers.parseEther(newListing.price),
        newListing.energyType
      );
      await tx.wait();
      // Refresh listings after successful transaction
      const listingCount = await contract.getListingCount();
      const newListingData = await contract.getListing(listingCount - 1);
      setListings([...listings, {
        id: listingCount - 1,
        seller: newListingData[0],
        amount: newListingData[1].toString(),
        price: ethers.formatEther(newListingData[2]),
        energyType: newListingData[3],
        isActive: newListingData[4]
      }]);
      setNewListing({ amount: '', price: '', energyType: '' });
    } catch (error) {
      console.error("Error listing energy:", error);
    }
  };

  const handleBuyEnergy = async (listingId, amount, price) => {
    if (!contract) return;
    try {
      const totalPrice = ethers.parseEther((Number(amount) * Number(price)).toFixed(18));
      const tx = await contract.buyEnergy(listingId, ethers.parseEther(amount), { value: totalPrice });
      await tx.wait();
      // Refresh listings and balance after successful purchase
      const updatedListing = await contract.getListing(listingId);
      const updatedListings = listings.map(listing => 
        listing.id === listingId 
          ? {
              ...listing,
              amount: updatedListing[1].toString(),
              isActive: updatedListing[4]
            }
          : listing
      );
      setListings(updatedListings);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const newBalance = await provider.getBalance(account);
      setWalletBalance(ethers.formatEther(newBalance));
    } catch (error) {
      console.error("Error buying energy:", error);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Energy Trading Dashboard</h1>
        <div className="flex items-center">
          <User className="mr-2" />
          <span className="mr-4">{username}</span>
          <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded flex items-center">
            <LogOut className="mr-2" /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 flex items-center"><Battery className="mr-2" /> Energy Balance</h2>
          <p className="text-2xl font-bold">7.5 kWh</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 flex items-center"><Zap className="mr-2" /> Current Production</h2>
          <p className="text-2xl font-bold">2.3 kW</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 flex items-center"><Wallet className="mr-2" /> Wallet Balance</h2>
          <p className="text-2xl font-bold">{parseFloat(walletBalance).toFixed(4)} ETH</p>
        </div>
      </div>

      <div className="mb-4">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('market')} 
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'market' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Energy Market
        </button>
        <button 
          onClick={() => setActiveTab('transactions')} 
          className={`px-4 py-2 rounded ${activeTab === 'transactions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-2">Energy Overview</h2>
          <p className="mb-4">Your energy production and consumption over the last 24 hours</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="production" stroke="#8884d8" name="Production" />
                <Line type="monotone" dataKey="consumption" stroke="#82ca9d" name="Consumption" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-2">Energy Market</h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">List New Energy</h3>
            <input
              type="number"
              placeholder="Amount (kWh)"
              value={newListing.amount}
              onChange={(e) => setNewListing({...newListing, amount: e.target.value})}
              className="mr-2 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Price (ETH per kWh)"
              value={newListing.price}
              onChange={(e) => setNewListing({...newListing, price: e.target.value})}
              className="mr-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Energy Type"
              value={newListing.energyType}
              onChange={(e) => setNewListing({...newListing, energyType: e.target.value})}
              className="mr-2 p-2 border rounded"
            />
            <button onClick={handleListEnergy} className="bg-green-500 text-white px-4 py-2 rounded">List Energy</button>
          </div>
          <h3 className="text-lg font-semibold mb-2">Available Listings</h3>
          {listings.map(listing => (
            <div key={listing.id} className="border p-2 mb-2 rounded">
              <p>Seller: {listing.seller}</p>
              <p>Amount: {listing.amount} kWh</p>
              <p>Price: {listing.price} ETH per kWh</p>
              <p>Type: {listing.energyType}</p>
              {listing.isActive && (
                <div>
                  <input
                    type="number"
                    placeholder="Amount to buy"
                    className="mr-2 p-1 border rounded"
                    id={`buy-amount-${listing.id}`}
                  />
                  <button
                    onClick={() => {
                      const amountToBuy = document.getElementById(`buy-amount-${listing.id}`).value;
                      handleBuyEnergy(listing.id, amountToBuy, listing.price);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Buy
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-2">Transaction History</h2>
          <p>Your recent energy trading transactions</p>
          {/* Implement transaction history here */}
          <p className="mt-4">Transaction history to be implemented</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
const EnergyTradingApp = () => {
  const [account, setAccount] = useState(null);
  const [username, setUsername] = useState('');

  const handleAuthSuccess = (account) => {
    setAccount(account);
    setUsername(account.slice(0, 6) + '...' + account.slice(-4));
  };

  const handleLogout = () => {
    setAccount(null);
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!account ? (
        <div className="flex items-center justify-center h-screen">
          <MetaMaskAuth onAuthSuccess={handleAuthSuccess} />
        </div>
      ) : (
        <MainDashboard account={account} username={username} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default EnergyTradingApp;