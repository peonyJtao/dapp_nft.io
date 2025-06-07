import { Box, Button, } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from 'next/router';
import { useReadContract } from "wagmi";
import { abi, contractAddress as address } from '../ABI';
import FlexBox from "./FlexBox";
import { H5 } from "./Typography";
const Header = () => {
  const router = useRouter()
  const data = useReadContract({
    abi,
    address,
    functionName: 'name',
  })
  console.log(data.data, '1111');
  const routerLink = (path: string) => {
    router.push(path);
  }
  return <FlexBox sx={{ pt: 1, pb: 1 }}>
    <FlexBox sx={{ gap: 2 }}>
      <Box sx={{
        width: "46px",
        height: "46px",
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer'
      }} onClick={() => routerLink("/")}>
        <img src="https://i.seadn.io/s/raw/files/e663a85a2900fdd4bfe8f34a444b72d3.jpg?h=250&w=250" alt="" height={"46"} width="46" />
      </Box>
      <H5>{data.data}</H5>
      <Button onClick={() => routerLink("/")}>
        所有NFT
      </Button>
      <Button onClick={() => routerLink("/nft")}>
        NFT商店
      </Button>
    </FlexBox>
    <FlexBox>
      <ConnectButton />
      <Button sx={{ ml: 2 }} variant="contained" >
        创建NFT
      </Button>
    </FlexBox>
  </FlexBox>
}
export default Header;