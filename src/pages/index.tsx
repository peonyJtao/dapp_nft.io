import { Box, CircularProgress } from '@mui/material';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useChainId, useConfig, useReadContract, useWatchContractEvent } from 'wagmi';
import { abi, contractAddress as address } from '../ABI';
import CardItem from '../components/CardItem';
import FlexBox from '../components/FlexBox';
const ipfsUrl = `https://ipfs.io/ipfs/`;
const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
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
  const [tokenIPFSURI, setTokenIPFSURI] = useState<string>("");
  const chains = useChainId()
  const x = useConfig();
  useEffect(() => {
    if (tokenURI.data && totalSupply.data) {
      getList();
    }
  }, [totalSupply.data, tokenURI.data]);
  const getList = async () => {
    setLoading(true);
    // @ts-ignore
    const lastIndexOf = tokenURI.data.lastIndexOf('/0');
    // @ts-ignore
    const _tokenURI = tokenURI.data.slice(7, lastIndexOf);
    setTokenIPFSURI(_tokenURI);
    const _list: any[] = [];
    for (let i = 0; i < Number(totalSupply.data); i++) {
      const _data = await getIPFSData(_tokenURI + "/" + i, i);
      _list.push(_data);
    }
    setList(_list);
    setLoading(false);
  }
  const getIPFSData = async (ipfs: string, index: number) => {
    return await fetch(`${ipfsUrl}${ipfs}`)
      .then(res => res.json()).then(data => ({
        ...data,
        id: index,
        image: `${ipfsUrl}${data.image.slice(7)}`
      }));
  }
  useEffect(() => {
    console.log(list);
  }, [list])
  const onMint = async (tokenId: number) => {
    const _data = await getIPFSData(tokenIPFSURI + "/" + tokenId, tokenId);
    setList(prev => prev.concat(_data))
  }
  const onBurn = (tokenId: number) => {
    setList(prev => prev.filter(item => item.id !== tokenId))
  }
  useWatchContractEvent({
    address,
    abi,
    eventName: 'Transfer',
    onLogs(logs: any[]) {
      const args = logs[0].args;
      // 铸造
      // @ts-ignore
      const _tokenId = Number(args.tokenId);
      if (args.from === '0x0000000000000000000000000000000000000000') onMint(_tokenId);
      // 销毁
      else if (args.to === '0x0000000000000000000000000000000000000000') onBurn(_tokenId);
    },
  })
  return (
    <Box mt={2}>
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
              list.map((item, index) => <CardItem record={item} key={index} />)
            }
          </FlexBox>
      }
    </Box>
  );
};

export default Home;