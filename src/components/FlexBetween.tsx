import { Box, BoxProps } from "@mui/material";
const FlexBetween = ({ sx, children, onClick }: { onClick?: () => void, sx?: BoxProps, children?: React.ReactNode }) => {
  return <Box display="flex" alignItems="center" justifyContent="space-between" sx={sx} onClick={() => onClick?.()}>
    {children}
  </Box>
}
export default FlexBetween;