import { Box, BoxProps } from "@mui/material";
const FlexBox = ({ sx, children, onClick }: { onClick?: () => void, sx?: BoxProps, children?: React.ReactNode }) => {
  return <Box display="flex" sx={sx} onClick={() => onClick?.()}>
    {children}
  </Box>
}
export default FlexBox;