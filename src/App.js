import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import WalletCard from './components/WalletCard';
import InheritanceForm from './components/InheritanceForm';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [copied, setCopied] = useState(false);

  const getTokens = async (address) => {
    try {
      console.log("Token listesi çekilecek adres:", address);
    } catch (error) {
      console.error("Token listesi çekme hatası:", error);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance));
        await getTokens(accounts[0]);
      } catch (error) {
        console.error("Bağlantı hatası:", error);
      }
    }
  };

  const copyToClipboard = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error("Kopyalama hatası:", err);
      }
    }
  };

  const maskAddress = (address) => {
    if (!address) return '';
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
  };

  return (
    <div className="App">
      <div className="wallet-container">
        {account ? (
          <>
            <div className="wallet-title">LEGACY WALLET</div>
            <div className="wallet-header">
              <div className="wallet-info">
                <div className="wallet-label">Bağlı Cüzdan Adresi</div>
                <div className="wallet-address">
                  <span className="masked-address">{maskAddress(account)}</span>
                  <div className="copy-icon" onClick={copyToClipboard}>
                    📋
                    {copied && <span className="copied-tooltip">Kopyalandı!</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="wallet-content">
              <WalletCard 
                account={account} 
                balance={balance}
              />
              
              <div className="divider"></div>
              
              <InheritanceForm account={account} />
            </div>
          </>
        ) : (
          <>
            <div className="wallet-title">LEGACY WALLET</div>
            <button className="connect-button" onClick={connectWallet}>
              Cüzdana Bağlan
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;