import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ZOHO = window.ZOHO;

export default function DialogComponent({
  handleClose,
  tickets,
  setToggle,
  toggle,
}) {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const handleUpdate = async () => {
    setLoading(true);
    let func_name = "Zoho_desk_ticket_handle_from_milestones";
    let req_data = {
      update_tickets: true,
      tickets: JSON.stringify(tickets),
      status: status,
    };
    await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(async function (
      result
    ) {
      // console.log(result);
      let resp = JSON.parse(result?.details?.output);
      console.log(resp);
      if (resp?.status === "success") {
        setTimeout(() => {
          setToggle(!toggle);
          handleClose();
        }, 2000);
      } else {
        console.log("error");
      }
    });
  };

  return (
    <React.Fragment>
      <Box sx={{ width: 300 }}>
        <Typography sx={{ fontSize: 20 }}>
          Change the status of the Tickets
        </Typography>

        <DialogContent>
          <Autocomplete
            id="status-autocomplete"
            size="small"
            options={["Open", "On Hold", "Escalated", "Closed"]}
            fullWidth
            sx={{ my: 1 }}
            getOptionLabel={(option) => option}
            value={status}
            onChange={(event, newValue) => {
              setStatus(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Status"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ width: 110, mr: 1 }}
            variant="outlined"
            size="small"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            sx={{ width: 110 }}
            variant="contained"
            size="small"
            disabled={!status}
            onClick={handleUpdate}
          >
            Update
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
}
