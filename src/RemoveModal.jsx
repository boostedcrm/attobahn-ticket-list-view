import * as React from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import {
  Box,
  CircularProgress,
  DialogContentText,
  Typography,
} from "@mui/material";

export default function RemoveModal({
  handleClose,
  handleRemoveRow,
  deleteLoading,
}) {
  return (
    <React.Fragment>
      <Box sx={{ width: 500 }}>
        <DialogContent sx={{ pt: 4, pl: 4, pr: 4 }}>
          <DialogContentText id="alert-dialog-description">
            <Typography sx={{ fontWeight: "bold", color: "black" }}>
              Do you want to delete this performance confirmation?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2.5, pr: 4 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClose}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleRemoveRow}
            disabled={deleteLoading}
            color="primary"
            variant="contained"
            sx={{ width: 90 }}
          >
            {deleteLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Proceed"
            )}
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
}
