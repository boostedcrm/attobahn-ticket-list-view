import * as React from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";

const ZOHO = window.ZOHO;

export default function NotificationSelector({
  handleClose,
  userList,
  tickets,
  ticketList,
  setSelectedArray,
}) {
  const [loading, setLoading] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState([userList[0]]);

  const handleSendNotification = async () => {
    let findVendor = selectedPerson?.find(
      (item) => item.email === "vendor@gmail.com"
    );
    let ticket_id_email = [];
    if (findVendor) {
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
    let withoutVendorEmail = selectedPerson?.filter(
      (item) => item.email !== "vendor@gmail.com"
    );
    let func_name = "Zoho_desk_ticket_handle_from_milestones";
    let req_data = {
      send_notification: true,
      tickets: JSON.stringify(ticket_id_email),
      emails: JSON.stringify(
        withoutVendorEmail?.length > 0
          ? withoutVendorEmail?.map((item) => item?.email)
          : []
      ),
    };

    setLoading(true);
    await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(async function (
      result
    ) {
      setSelectedArray([]);
      setLoading(false);
      setSelectedPerson([]);
      handleClose();

      //   let resp = JSON.parse(result?.details?.output);
      //   // console.log(resp);
      //   if (resp?.status === "success") {
      //     setTimeout(() => {
      //       setSelectedArray([]);
      //       handleClose();
      //       setLoading(false);
      //     }, 2000);
      //   } else {
      //     console.log("error");
      //   }
    });
  };

  return (
    <React.Fragment>
      <Box sx={{ width: 500 }}>
        {/* {JSON.stringify(selectedPerson)} */}
        <DialogContent sx={{ px: 1 }}>
          <Autocomplete
            multiple
            id="tags-outlined"
            // limitTags={3}
            options={userList}
            getOptionLabel={(option) => option?.title}
            defaultValue={[userList[0]]}
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
      </Box>
    </React.Fragment>
  );
}
