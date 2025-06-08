import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useBlockNumber, useReadContract, useWriteContract } from "wagmi";
import { abi, contractAddress as address, nftAbi, nftAddress } from '../ABI';
import { infura_sepolia } from '../infura';

import { Box, CircularProgress } from "@mui/material";
import CardItem from '../components/CardItem';
import FlexBox from "../components/FlexBox";
const provider = new ethers.JsonRpcProvider(infura_sepolia);
const blockStartNumber = 8495059; // 合约创建时的区块高度
const ipfsUrl = `https://ipfs.io/ipfs/`;
const Shop = () => {
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(true);
  // const x = useReadContract({
  //   abi: nftAbi,
  //   address: nftAddress,
  //   functionName: 'getAllNfts',
  // });
  // 
  const [tokenIPFSURI, setTokenIPFSURI] = useState<string>("");
  const tokenURI = useReadContract({
    abi,
    address,
    functionName: 'tokenURI',
    args: [0],
  })
  useEffect(() => {
    if (tokenURI.data) {
      const _tokenURI: string = tokenURI.data as string;
      const lastIndexOf = _tokenURI.lastIndexOf('/0');
      setTokenIPFSURI(_tokenURI.slice(7, lastIndexOf));
    }
  }, [tokenURI.data])
  const getIPFSData = async (ipfs: string, index: number) => {
    return await fetch(`${ipfsUrl}${ipfs}`)
      .then(res => res.json()).then(data => ({
        ...data,
        id: index,
        image: `${ipfsUrl}${data.image.slice(7)}`
      }));
  }
  const [list, setList] = useState<any[]>([]);
  const blockNumber = useBlockNumber();
  const init = async () => {
    setLoading(true);
    // 连接合约
    const contract = new ethers.Contract(nftAddress, nftAbi, provider);
    const _queryList = await contract.queryFilter('List', blockStartNumber, blockNumber.data);
    const _list: any[] = [];
    for (let i = 0; i < _queryList.length; i++) {
      // @ts-ignore
      const _tokenURI = Number(_queryList[i].args[2]);
      const _data = await getIPFSData(tokenIPFSURI + "/" + _tokenURI, _tokenURI);
      _list.push(_data);
    }
    setList(_list);
    setLoading(false);
  }
  useEffect(() => {
    if (tokenIPFSURI) init();
  }, [tokenIPFSURI])
  console.log(list, 'Number(_tokenURI)');

  return <Box mt={2}>
    {
      loading ? <Box sx={{
        margin: '150px 0',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <CircularProgress size={40} color="inherit" />
      </Box>
        :
        <FlexBox sx={{
          flexWrap: 'wrap',
          justifyContent: 'start',
          gap: 2,
        }}>
          {
            list.map((item, index) => <CardItem record={item} key={index} type="update" />)
          }
        </FlexBox>
    }
  </Box>
}
export default Shop;