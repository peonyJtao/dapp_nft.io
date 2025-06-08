import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, Divider } from "@mui/material";
import { useState } from "react";
import FlexBetween from './FlexBetween';
import FlexBox from "./FlexBox";
import { H5 } from "./Typography";

const CollapseBox = ({ children, icon, title, open }: { open?: boolean, children?: React.ReactNode, icon: React.ReactNode, title?: string }) => {
  const [collapseOpen, setCollapseOpen] = useState(open || false);
  return <>
    <FlexBetween sx={{
      padding: '12px 15px',
      // @ts-ignore
      cursor: 'pointer'
    }} onClick={() => setCollapseOpen(!collapseOpen)}>
      <FlexBox sx={{
        alignItems: 'center',
      }}>
        {icon}
        <H5 ml={2}>{title}</H5>
      </FlexBox>

      <ExpandMoreIcon sx={{
        transform: collapseOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'all 0.3s ease',
      }} />
    </FlexBetween>
    <Divider />
    <Collapse in={collapseOpen} timeout="auto" unmountOnExit>
      <Box sx={{
        padding: '15px'
      }}>
        {
          children
        }
        <Divider sx={{ mt: 2 }} />
      </Box>
    </Collapse>

  </>
}
export default CollapseBox;