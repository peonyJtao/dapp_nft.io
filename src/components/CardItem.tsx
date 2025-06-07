import { Box, Card } from "@mui/material";
import { H5 } from "./Typography";
import { useRouter } from "next/router";
type Record = {
  name: string,
  image: string,
  description: string,
  attributes: {
    trait_type: string,
    value: string
  }[]
}
const CardItem = ({
  record
}: {
  record: Record
}) => {
  const router = useRouter();
  return <Card onClick={()=>{
    // router.push()
  }} sx={{
    cursor: 'pointer',
    '& .MuiBox-root:hover': {
      '& .object-cover': {
        transform: 'scale(1.12)',
        transitionDuration: '0.4s'
      }
    }
  }}>
    <Box sx={{
      width: '274px',
      height: '274px',
    }}>
      <img width={274} height={274} src={record.image} alt="" />
    </Box>
    <H5 sx={{
      padding: '4px 8px'
    }}>
      {record.name}
    </H5>
  </Card>
}
export default CardItem;