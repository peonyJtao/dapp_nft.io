import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import { abi, contractAddress as address, nftAbi, nftAddress } from "../ABI";
import { Record } from './CardItem';
import FlexBetween from "./FlexBetween";
import FlexBox from "./FlexBox";
import { H5 } from "./Typography";
const DialogSwap = ({ open, record, name, onClose, initAmount, onSave, type = 'create' }: {
  open: boolean,
  onClose: () => void,
  onSave: () => void,
  record: Record,
  name: string,
  type?: 'create' | 'update',
  initAmount: BigInt
}) => {
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>('');
  useEffect(() => {
    if (initAmount) {
      setAmount(ethers.formatEther(initAmount + ''));
    }
  }, [initAmount]);
  useEffect(() => {
    if (open) {
      // const _amount = useReadContract({
      //   address: nftAddress,
      //   abi: nftAbi,
      //   functionName: 'nftList',
      //   args: [address, record.id],
      // })
      // console.log(_amount, '_amount');
    }
  }, [open])
  const onSumbit = () => {
    const _void = {
      create: _onSave,
      update: _onUpdate
    }[type]?.();
  }
  const _onUpdate = () => {
    if (Number(amount) < 0) return;
    setLoading(true);
    writeContract({
      abi: nftAbi,
      address: nftAddress,
      functionName: 'updatePrice',
      args: [address, record.id, ethers.parseEther(amount)],
    }, {
      onSuccess: () => {
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      }
    });
  };
  const _onSave = () => {
    if (Number(amount) < 0) return;
    setLoading(true);
    // 先授权
    writeContract({
      abi,
      address,
      functionName: 'approve',
      args: [nftAddress, record.id],
    }, {
      onSuccess: () => {
        // 发布订单
        writeContract({
          abi: nftAbi,
          address: nftAddress,
          functionName: 'create',
          args: [address, record.id, ethers.parseEther(amount)],
        }, {
          onSuccess: () => {
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          }
        })
      },
      onError: () => {
        setLoading(false);
      }
    })
  }
  return <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paper': { width: '800px' } }}>
    <DialogTitle id="alert-dialog-title">Quick list</DialogTitle>
    <DialogContent sx={{
      maxHeight: 'calc(100vh - 180px)',
    }}>
      <FlexBetween sx={{ gap: 2, mb: 2 }}>
        <FlexBox sx={{
          alignItems: "center",
          gap: 2
        }}>
          <img width={72} height={72} src={record.image} alt="" />
          <Box>
            <H5>{record.name}</H5>
            <H5 mt={1}>{name}</H5>
          </Box>
        </FlexBox>
        <Box>
          <H5 sx={{
            textAlign: 'right'
          }}>Listing price</H5>
          <H5 mt={1}>{amount || '--'} ETH</H5>
        </Box>
      </FlexBetween>
      <TextField
        fullWidth
        value={amount}
        type="number"
        onChange={(e) => setAmount(e.target.value)}
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
          },
        }}
      ></TextField>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={onClose}>取消</Button>
      <Button onClick={onSumbit} loading={loading} variant="contained">
        {{
          create: '确定',
          update: '更新'
        }[type] || '确定'}
      </Button>
    </DialogActions>
  </Dialog>
}
export default DialogSwap;