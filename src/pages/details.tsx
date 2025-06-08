import { Label, Notes, Sell, VerticalSplit } from '@mui/icons-material';
import { Box, Button, Card, CircularProgress } from "@mui/material";

import { ethers } from 'ethers';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { abi, contractAddress as address, nftAbi, nftAddress } from '../ABI';
import type { Record } from '../components/CardItem';
import CollapseBox from "../components/Collapse";
import FlexBox from "../components/FlexBox";
import { H3, H5, Tiny } from "../components/Typography";
const ipfsUrl = `https://ipfs.io/ipfs/`
const Details = () => {
  const router = useRouter();
  const { writeContract } = useWriteContract();
  const { query: { id } } = router;
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<Record>();
  const [tokenIPFSURI, setTokenIPFSURI] = useState<string>("");
  const account = useAccount();
  const tokenURI = useReadContract({
    abi,
    address,
    functionName: 'tokenURI',
    args: [id],
  })
  const ownerOf = useReadContract({
    abi,
    address,
    functionName: 'ownerOf',
    args: [id],
  })

  const nftList = useReadContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'nftList',
    args: [address, id],
  })
  console.log(nftList, 'nftList');

  const getList = async () => {
    // @ts-ignore
    const lastIndexOf = tokenURI.data.lastIndexOf('/0');
    // @ts-ignore
    const _tokenURI = tokenURI.data.slice(7, lastIndexOf);
    setTokenIPFSURI(_tokenURI);
    setRecord(await getIPFSData(_tokenURI + "/" + id, Number(id)));
    setLoading(false);
  }
  useEffect(() => {
    if (tokenURI.data) getList()
  }, [tokenURI.data])
  console.log(record, 'record')


  const getIPFSData = async (ipfs: string, index: number) => {
    return await fetch(`${ipfsUrl}${ipfs}`)
      .then(res => res.json()).then(data => ({
        ...data,
        id: index,
        image: `${ipfsUrl}${data.image.slice(7)}`
      }));
  }
  console.log(ethers.parseEther("1"));
  // 创建
  const onCreate = async () => {
    console.log([nftAddress, id, ethers.parseEther("1")]);
    // await writeContract({
    //   abi,
    //   address,
    //   functionName: 'approve',
    //   args: [nftAddress, id],
    // })
    await writeContract({
      abi: nftAbi,
      address: nftAddress,
      functionName: 'create',
      args: [nftAddress, id, ethers.parseEther("1")],
    })
  }
  const [open, setOpen] = useState(false);
  return loading ? <Box sx={{
    margin: '150px 0',
    display: 'flex',
    justifyContent: 'center',
  }}>
    <CircularProgress size={40} color="inherit" />
  </Box> : <FlexBox>
    <Box sx={{
      width: '615px',
      height: '615px',
    }}>
      <Card sx={{
        overflow: 'hidden',
        width: '100%',
        aspectRatio: 1,
        '& img': {
          width: '100%',
          height: '100%',
        }
      }}>
        <img src={record?.image} alt="" />
      </Card>
      <Card sx={{
        mt: 2
      }}>
        <CollapseBox open title="描述" icon={<Notes />}>
          <Tiny>{record?.description}</Tiny>
        </CollapseBox>
        <CollapseBox title="特征" icon={<Label />}>
          <FlexBox sx={{
            flexWrap: 'wrap',
            justifyContent: 'start',
            gap: 2,
            padding: '15px 4px',
          }}>
            {
              record?.attributes?.map((item, index) => <Card key={index} sx={{
                width: '30%',
                padding: '10px 8px',
                textAlign: 'center',
              }}>
                <H5 sx={{}}>{item.trait_type?.toUpperCase()}</H5>
                <Tiny mt={2}>{item.value}</Tiny>
              </Card>)
            }
          </FlexBox>
        </CollapseBox>
        <CollapseBox title="关于" icon={<VerticalSplit />}>
          <Tiny>此系列尚无描述。</Tiny>
        </CollapseBox>
      </Card>
    </Box>
    <Box sx={{
      p: 2,
      flex: 1
    }}>
      <H3 mb={2}>{record?.name}</H3>
      <H5 >拥有者: {ownerOf.data}</H5>
      <Box mt={3} mb={3}>
        {
          account.address === ownerOf.data ? (
            <Button variant="contained" onClick={() => {
              setOpen(true)
            }}>
              出售
            </Button>
          ) : <Button onClick={() => {
            setOpen(true)
          }} variant='contained' startIcon={<Sell />}>
            报价
          </Button>
        }
      </Box>
      <CollapseBox open title="价格历史" icon={<Notes />}>
        <Tiny>{record?.description}</Tiny>
      </CollapseBox>
      <CollapseBox open title="列表" icon={<Notes />}>
        <Tiny>{record?.description}</Tiny>
      </CollapseBox>
      <CollapseBox open title="报价" icon={<Notes />}>
        <Tiny>{record?.description}</Tiny>
      </CollapseBox>
    </Box>
  </FlexBox>
}
export default Details;