import { Box } from '@mui/material';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { abi, contractAddress as address } from '../ABI';
import CardItem from '../components/CardItem';
import FlexBox from '../components/FlexBox';
const ipfsUrl = `https://ipfs.io/ipfs/`
const Home: NextPage = () => {
  const [list, setList] = useState<any[]>([]);
  // 获取当前已经铸造的nft
  const totalSupply = useReadContract({
    abi,
    address,
    functionName: 'totalSupply',
  })
  const tokenURI = useReadContract({
    abi,
    address,
    functionName: 'tokenURI',
    args: [0],
  })
  useEffect(() => {
    if (tokenURI.data && totalSupply.data) {
      getList();
    }
  }, [totalSupply.data, tokenURI.data]);
  const getList = async () => {
    // @ts-ignore
    const lastIndexOf = tokenURI.data.lastIndexOf('/0');
    // @ts-ignore
    const _tokenURI = tokenURI.data.slice(7, lastIndexOf);
    const _list: any[] = [];
    for (let i = 0; i < Number(totalSupply.data); i++) {
      const _data = await getIPFSData(_tokenURI + "/" + i);
      _list.push(_data);
    }
    setList(_list);
  }
  const getIPFSData = async (ipfs: string) => {
    return await fetch(`${ipfsUrl}${ipfs}`)
      .then(res => res.json()).then(data => ({
        ...data,
        image: `${ipfsUrl}${data.image.slice(7)}`
      }));
  }
  useEffect(() => {
    console.log(list);
  }, [list])
  useWatchContractEvent({
    address,
    abi,
    eventName: 'Transfer',
    onLogs(logs) {
      console.log(logs, 'logs');
      const _data = useReadContract({
        abi,
        address,
        functionName: 'totalSupply',
      })
      if (_data.data) {
        // @ts-ignore
        setList(_data.data);
      }
    },
  })
  return (
    <Box mt={2}>
      <FlexBox sx={{
        flexWrap: 'wrap',
        justifyContent: 'start',
        gap: 2,
      }}>
        {
          list.map((item, index) => <CardItem record={item} key={index} />)
        }
      </FlexBox>
    </Box>
  );
};

export default Home;