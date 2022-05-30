
import styles from '../styles/Home.module.css';
import {useEffect, useState} from 'react';
import axios from 'axios';
import Web3Modal from "web3modal";
import { ethers } from 'ethers' ;
import { nftAddress,marketPlaceAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarketPlace from '../artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json';
export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  useEffect(()=>{
    loadNfts();
  },[])

  const loadNfts = async ()=>{
    const provider =  new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(nftAddress,NFT.abi,signer);
    const marketcontract= new ethers.Contract(marketPlaceAddress, NFTMarketPlace.abi,signer);
    const data = await marketcontract.fetchMarketItems();
    const items = await Promise.all(data.map(async i =>{
      const tokenUri = await marketcontract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item={
        price,
        tokenid:i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image : meta.data.image,
        name: meta.data.name,
        description : meta.data.description
      }
      return item
    }));
    console.log(items);
    setNfts(items);
    setLoadingState('loaded');

  }
  const buyNft= async (nft) =>{
    const web3modal= new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract =new ethers.Contract(marketPlaceAddress, NFTMarketPlace.abi,signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether') ;
    console.log(nft);
    const transaction = await contract.createMarketSale(nft.tokenid,{value:price})

    await transaction.wait();
    loadNfts();

  }
  if(loadingState === 'loaded' && !nfts.length){
    return(
      <h1 className='px-20 py-10 text-xl'>No itmes in marketplace</h1>
    )
  }
  return (
    <div className="flex justify-center">
     <div className='px-4' style={{maxwidth:'1600px'}}>
       <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
         
        {
         nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
       </div>

     </div>
    </div>
  )
}
