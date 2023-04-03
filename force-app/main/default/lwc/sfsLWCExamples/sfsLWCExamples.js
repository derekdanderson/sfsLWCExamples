import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

export default class SfsLWCExamples extends LightningElement {
  @api recordId;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [
      "ServiceAppointment.AppointmentNumber",
      "ServiceAppointment.Subject",
      "ServiceAppointment.ParentRecordId"
    ]
  })
  serviceAppt;

  get apptNumber() {
    console.log(this.serviceAppt);
    return this.serviceAppt?.data?.fields?.AppointmentNumber?.value;
  }

  get apptSubject() {
    return this.serviceAppt?.data?.fields?.Subject?.value;
  }

  get apptParRecId() {
    return this.serviceAppt?.data?.fields?.ParentRecordId?.value;
  }

  @wire(getRecord, {
    recordId: "$apptParRecId",
    fields: ["WorkOrder.WorkOrderNumber", "WorkOrder.WorkTypeId"]
  })
  workOrder;

  get woNumber() {
    console.log(this.workOrder);
    return this.workOrder?.data?.fields?.WorkOrderNumber?.value;
  }
}
