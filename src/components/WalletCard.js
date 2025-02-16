import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WalletCard.css';

const TOKENS = [
  { symbol: 'ETH', address: null },
  { 
    symbol: 'USDT', 
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  },
  { 
    symbol: 'USDC', 
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  }
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

function WalletCard({ account, balance }) {
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getTokenBalance = async () => {
      if (!account || !window.ethereum) return;
      
      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        if (selectedToken.address === null) {
          // ETH bakiyesi
          setTokenBalance(balance || '0');
        } else {
          // ERC20 token bakiyesi
          const contract = new ethers.Contract(
            selectedToken.address,
            ERC20_ABI,
            provider
          );

          try {
            const tokenBalance = await contract.balanceOf(account);
            // Önceden bilinen decimal değerini kullan
            const decimals = selectedToken.decimals;
            setTokenBalance(ethers.formatUnits(tokenBalance, decimals));
          } catch (error) {
            console.error(`Token bakiye hatası (${selectedToken.symbol}):`, error);
            setTokenBalance('0');
          }
        }
      } catch (error) {
        console.error('Bakiye çekme hatası:', error);
        setTokenBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    getTokenBalance();
  }, [account, selectedToken, balance]);

  return (
    <div className="wallet-card">
      <div className="balance-info">
        <div className="token-selector">
          <label className="balance-label">Token Seç</label>
          <select 
            className="token-select"
            value={selectedToken.symbol}
            onChange={(e) => setSelectedToken(TOKENS.find(t => t.symbol === e.target.value))}
          >
            {TOKENS.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="balance-display">
          <div className="balance-label">Bakiye</div>
          <div className="balance-value">
            {isLoading ? (
              "Yükleniyor..."
            ) : (
              `${Number(tokenBalance).toFixed(selectedToken.decimals || 4)} ${selectedToken.symbol}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletCard;