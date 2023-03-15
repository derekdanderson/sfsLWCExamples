import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

export default class SfsLWCExamples extends LightningElement {
  @api recordId;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [
      "ServiceAppointment.AppointmentNumber"
    ]
  })
  serviceAppt;

  get appointmentNumber() {
    console.log(this.serviceAppt);
    return this.serviceAppt?.data?.fields?.AppointmentNumber?.value;
  }
}
