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
  const [status, setStatus] = React.useState("");

  const handleChange = (event) => {
    setStatus(event.target.value);
  };

  const handleUpdate = async () => {
    if (!status) {
      return;
    }
    console.log(tickets);

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
      }
    });
  };

  return (
    <React.Fragment>
      <DialogTitle>{"Change the status of the Tickets."}</DialogTitle>

      <DialogContent>
        <FormControl sx={{ mt: 2 }} fullWidth>
          <InputLabel id="demo-simple-select-label">Status</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={status}
            label="Status"
            onChange={handleChange}
          >
            <MenuItem value={"Open"}>Open</MenuItem>
            <MenuItem value={"On Hold"}>On Hold</MenuItem>
            <MenuItem value={"Escalated"}>Escalated</MenuItem>
            <MenuItem value={"Closed"}>Closed</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={handleUpdate}>
          Update
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}
