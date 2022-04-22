import { useState } from "react";
import {ethers} from "ethers";
import {create as ipfsHttpClient} from 'ipfs-http-client';
import {useRouter} from 'next/router';
import Web3Modal from 'web3modal';
import axios from 'axios';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarketPlace from '../artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json';
import { nftAddress, marketPlaceAddress } from "../config";
import { useEffect } from "react";

export default function CreatorDashboard(){
    const [nfts, setNfts] = useState([]);
    const[sold, setSold] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    const router = useRouter();
  
    useEffect(()=>{
      loadNfts();
    },[])
    const loadNfts = async ()=>{
        const web3modal= new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        
        const tokenContract = new ethers.Contract(nftAddress,NFT.abi,provider);
        const marketcontract= new ethers.Contract(marketPlaceAddress, NFTMarketPlace.abi,signer);
        const data = await marketcontract.fetchMyNFTs();
        const items = await Promise.all(data.map(async i =>{
            console.log(i);
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
        const solditems = items.filter(i =>i.sold);
        console.log(items);
        setSold(solditems)
        setNfts(items);
        setLoadingState('loaded');
    
      }
      return (
        <div className="flex justify-center">
            
            <div className='px-4' style={{maxwidth:'1600px'}}>
             {Boolean(nfts.length) &&(
                 <div>
                     <h2 className="text-2xl py-2">Item Bought</h2>
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
                     </div>
                   </div>
                 ))
               }
            </div>
                 </div>
             )}
         </div>
         <div className='px-4' style={{maxwidth:'1600px'}}>
             {Boolean(sold.length) &&(
                 <div>
                     <h2 className="text-2xl py-2">Item Sold</h2>
                     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
             
             {
              sold.map((nft, i) => (
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
                     </div>
                   </div>
                 ))
               }
            </div>
                 </div>
             )}
         </div>
        </div>
      )
}