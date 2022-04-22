import { useState } from "react";
import {ethers} from "ethers";
import {create as ipfsHttpClient} from 'ipfs-http-client';
import {useRouter} from 'next/router';
import Web3Modal from 'web3modal';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarketPlace from '../artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json';
import { nftAddress, marketPlaceAddress } from "../config";

export default function CreateItem(){
    const[fileUrl, setFileUrl] = useState(null);
    const[formInput, updateForminput] = useState({price:'',name:'',description:''});
    const router = useRouter();
    async function onChange(e) {
        const file =e.target.files[0]
        try{
            const added = await client.add(
                file,
                {progress: (prog)=> console.log(`recieved : ${prog}`)}
            )
            const url =`https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(url);
            
        }
        catch(e){
            console.log(e);
        }
    }
    async function createitem(){
        const{name ,description ,price} = formInput;
        console.log(name ,description ,price);
        if(!name || !description || !price || !fileUrl) return
        const data = JSON.stringify({
            name, description, image:fileUrl
        })
        try{
            const added = await client.add(data);
            const url =`https://ipfs.infura.io/ipfs/${added.path}`;
            createSale(url)

        }catch(e){
            console.log(e)
        }
    }
    async function createSale(url) {
        const Web3modal = new Web3Modal();
        const connection = await Web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        let contract = new ethers.Contract(nftAddress,NFT.abi,signer);
        let transaction = await contract.createNFT(url);
        let tx = await transaction.wait();
        console.log(tx);
        let event = tx.events[0];
        let value = event.args[2];
        let tokenid = value.toNumber();
        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        contract = new ethers.Contract(marketPlaceAddress, NFTMarketPlace.abi, signer);
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();

        transaction = await contract.createToken(
         url,price,{value:listingPrice}
        )
        await transaction.wait();
        router.push('/')


    }
    return (
        <div className=" flex justify- center">
            <div className = "w-1/2 flex flex-col pb-12">
                <input placeholder="Asset name" className=" mt-8 border rounded p-4"
                onChange={ e=> updateForminput({...formInput, name: e.target.value})}
                />
                 <textarea placeholder="Asset Description" className=" mt-2 border rounded p-4"
                onChange={ e=> updateForminput({...formInput, description: e.target.value})}
                />
                 <input placeholder="Asset Price in matic" className=" mt-2 border rounded p-4"
                onChange={ e=> updateForminput({...formInput, price: e.target.value})}
                />
                 <input type ="file" placeholder="Asset name" className=" my-4"
                onChange={onChange}
                />
                { <img src={fileUrl} className="rounded mt-4" width="350" />||fileUrl}
                <button onClick={createitem} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create Digital Assests 
                </button>
            </div>
        </div>
    )

}
