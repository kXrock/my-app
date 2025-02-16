import React, { useState } from 'react';
import { ethers } from 'ethers';
import './InheritanceForm.css';

const LEGACY_WALLET_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ActivityUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "claimInheritance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "heir",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "InheritanceClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "heir",
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
				"internalType": "string",
				"name": "heirName",
				"type": "string"
			}
		],
		"name": "InheritanceSet",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_heir",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_heirName",
				"type": "string"
			}
		],
		"name": "setInheritance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "updateActivity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_heir",
				"type": "address"
			}
		],
		"name": "getInheritanceDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "heir",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "heirName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "lastActivity",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INHERITANCE_PERIOD",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "inheritances",
		"outputs": [
			{
				"internalType": "address",
				"name": "heir",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "heirName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "lastActivity",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const LEGACY_WALLET_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138"; // Kontrat deploy edildikten sonra buraya eklenecek

function InheritanceForm({ account }) {
  const [heirName, setHeirName] = useState('');
  const [heirAddress, setHeirAddress] = useState('');
  const [inheritanceAmount, setInheritanceAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!window.ethereum) throw new Error("MetaMask gerekli");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LEGACY_WALLET_ADDRESS, LEGACY_WALLET_ABI, signer);

      // ETH değerini Wei'ye çevir
      const amountInWei = ethers.parseEther(inheritanceAmount);

      // Sadece mirası ayarla, ETH transferi yok
      const tx = await contract.setInheritance(
        heirAddress,
        amountInWei,
        heirName
      );

      await tx.wait();
      
      setSuccess('Miras başarıyla ayarlandı! Varis 1 yıl içinde aktivite olmazsa mirası talep edebilecek.');
      setHeirName('');
      setHeirAddress('');
      setInheritanceAmount('');
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inheritance-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Varis Adı</label>
          <input
            type="text"
            className="form-input"
            value={heirName}
            onChange={(e) => setHeirName(e.target.value)}
            placeholder="Varis adını giriniz"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Varis Cüzdan Adresi</label>
          <input
            type="text"
            className="form-input"
            value={heirAddress}
            onChange={(e) => setHeirAddress(e.target.value)}
            placeholder="0x..."
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Miras Miktarı (ETH)</label>
          <input
            type="number"
            step="0.0001"
            min="0"
            className="form-input"
            value={inheritanceAmount}
            onChange={(e) => setInheritanceAmount(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          type="submit" 
          className="form-button"
          disabled={isLoading}
        >
          {isLoading ? 'İşlem Yapılıyor...' : 'Mirası Belirle'}
        </button>
      </form>
    </div>
  );
}

export default InheritanceForm;