import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, Divider } from "@mui/material";
import { useState } from "react";
import FlexBetween from './FlexBetween';
import FlexBox from "./FlexBox";
import { H5 } from "./Typography";

const CollapseBox = ({ children, icon, hasCollaps = true, title, open }: { hasCollaps?: boolean, open?: boolean, children?: React.ReactNode, icon?: React.ReactNode, title?: string }) => {
  const [collapseOpen, setCollapseOpen] = useState(open || false);
  return <>
    <FlexBetween sx={{
      padding: '12px 15px',
      // @ts-ignore
      cursor: 'pointer'
    }} onClick={() => hasCollaps ? setCollapseOpen(!collapseOpen) : null}>
      <FlexBox sx={{
        alignItems: 'center',
        gap: 2
      }}>
        {icon}
        <H5 >{title}</H5>
      </FlexBox>
      {
        hasCollaps && <ExpandMoreIcon sx={{
          transform: collapseOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'all 0.3s ease',
        }} />
      }

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