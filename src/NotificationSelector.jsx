import * as React from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
} from "@mui/material";

const ZOHO = window.ZOHO;

export default function NotificationSelector({
  handleClose,
  userList,
  tickets,
  ticketList,
  setSelectedArray,
  vendor,
  setOpenSnackbar,
  setSeverity,
  setSnackbarMessage,
}) {
  const [loading, setLoading] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState([]);

  const [vendorChecked, setVendorChecked] = React.useState(true);

  const handleChange = (event) => {
    setVendorChecked(event.target.checked);
  };

  const handleSendNotification = async () => {
    // let findVendor = selectedPerson?.find(
    //   (item) => item.email === "vendor@gmail.com"
    // );
    let ticket_id_email = [];
    if (vendorChecked) {
      ticketList.forEach((element) => {
        if (tickets.includes(element.id)) {
          ticket_id_email.push({
            id: element.id,
            subject: element?.subject,
            ticketNumber: element?.ticketNumber,
            email: element?.email || null,
          });
        }
      });
    } else {
      ticketList.forEach((element) => {
        if (tickets.includes(element.id)) {
          ticket_id_email.push({
            id: element.id,
            subject: element?.subject,
            ticketNumber: element?.ticketNumber,
            email: null,
          });
        }
      });
    }
    // let withoutVendorEmail = selectedPerson?.filter(
    //   (item) => item.email !== "vendor@gmail.com"
    // );
    let func_name = "Zoho_desk_ticket_handle_from_milestones";
    let req_data = {
      send_notification: true,
      tickets: JSON.stringify(ticket_id_email),
      emails: JSON.stringify(
        selectedPerson?.length > 0
          ? selectedPerson?.map((item) => item?.email)
          : []
      ),
    };
    setLoading(true);
    await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(async function (
      result
    ) {
      let resp = JSON.parse(result?.details?.output);
      if (resp?.status === "success") {
        setTimeout(() => {
          setSelectedArray([]);
          handleClose();
          setLoading(false);
          setSeverity("success");
          setSnackbarMessage("Notification sent successfully");
          setOpenSnackbar(true);
        }, 2000);
      } else {
        setLoading(false);
        setSeverity("error");
        setSnackbarMessage("Something went wrong..!");
        setOpenSnackbar(true);
      }
    });
  };

  return (
    <React.Fragment>
      <Box sx={{ width: 500 }}>
        <FormControlLabel
          control={
            <Checkbox
              sx={{ ml: 1 }}
              checked={vendorChecked}
              onChange={handleChange}
              inputProps={{ "aria-label": "controlled" }}
            />
          }
          label={`${vendor?.Contact_Name}	${vendor?.Contact_Last_Name}`}
        />

        <DialogContent sx={{ px: 1 }}>
          <Autocomplete
            multiple
            id="tags-outlined"
            // limitTags={3}
            options={userList}
            getOptionLabel={(option) => option?.title}
            value={selectedPerson}
            onChange={(event, newValue) => {
              setSelectedPerson(newValue);
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Send To"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ width: 95, mr: 1 }}
            variant="outlined"
            size="small"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            sx={{ width: 95 }}
            variant="contained"
            size="small"
            disabled={selectedPerson?.length < 1 || loading}
            onClick={handleSendNotification}
          >
            {loading ? <CircularProgress size={21} /> : "Send"}
          </Button>
        </DialogActions>
        {/* {JSON.stringify(vendorChecked)}
        {JSON.stringify(selectedPerson)} */}
      </Box>
    </React.Fragment>
  );
}
