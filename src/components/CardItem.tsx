import { Box, Button, Card } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { abi, contractAddress as address, nftAbi, nftAddress } from "../ABI";
import DialogSwap from './DialogSwap';
import { H5 } from "./Typography";
export type Record = {
  name: string,
  image: string,
  description: string,
  id: number,
  attributes: {
    trait_type: string,
    value: string
  }[]
}
const CardItem = ({
  record,
  type = 'create'
}: {
  record: Record,
  type?: 'create' | 'update'
}) => {
  const router = useRouter();
  const account = useAccount();
  const ownerOf = type === 'create' ? useReadContract({
    abi,
    address,
    functionName: 'ownerOf',
    args: [record.id],
  }) : useReadContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'nftList',
    args: [address, record.id],
  })
  const name = useReadContract({
    abi,
    address,
    functionName: 'name',
  })
  const [open, setOpen] = useState<boolean>(false);

  // @ts-ignore
  const owner = type === 'create' ? ownerOf.data : ownerOf?.data?.[0];
  console.log(ownerOf.data, 'ownerOf');
  // @ts-ignore
  const initAmount = type === 'create' ? null : ownerOf?.data?.[1];
  return <>
    <Card onClick={() => {
      router.push(`/details?id=${record.id}`)
    }} sx={{
      cursor: 'pointer',
      '& .MuiBox-root:hover': {
        '& img': {
          transform: 'scale(1.12)',
        }
      }
    }}>
      <Box sx={{
        width: '274px',
        height: '274px',
        overflow: 'hidden',
        '& img': {
          transition: 'all 0.4s ease-in-out'
        }
      }}>
        <img width={274} height={274} src={record.image} alt="" />
      </Box>
      <Box sx={{
        padding: '30px 15px'
      }}>
        <H5 >
          {record.name}
        </H5>
        <H5 mt={1}>
          {name.data}
        </H5>
      </Box>
      {owner === account.address && <Button onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}>{type === 'create' ? '出售' : '更新'}</Button>}
    </Card>
    <DialogSwap
      open={open}
      type={type}
      onClose={() => setOpen(false)}
      record={record}
      onSave={() => setOpen(false)}
      name={name.data as string}
      initAmount={initAmount}
    />
  </>
}
export default CardItem;
