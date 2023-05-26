import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import APPTID_FIELD from "@salesforce/schema/ServiceAppointment.Id";
import APPTNUMBER_FIELD from "@salesforce/schema/ServiceAppointment.AppointmentNumber";
import APPTSUBJECT_FIELD from "@salesforce/schema/ServiceAppointment.Subject";
import APPTSTATUS_FIELD from "@salesforce/schema/ServiceAppointment.Status";
import APPTPARENTID_FIELD from "@salesforce/schema/ServiceAppointment.ParentRecordId";
import WONUMBER_FIELD from "@salesforce/schema/WorkOrder.WorkOrderNumber";
import WOWORKTYPEID_FIELD from "@salesforce/schema/WorkOrder.WorkTypeId";

export default class SfsLWCExamples extends LightningElement {
  @api recordId;
  showEdit = false;
  apptStatusSelected = "";
  assignedResources;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [
      APPTNUMBER_FIELD,
      APPTSUBJECT_FIELD,
      APPTSTATUS_FIELD,
      APPTPARENTID_FIELD
    ]
  })
  serviceAppt;

  get apptNumber() {
    return getFieldValue(this.serviceAppt?.data, APPTNUMBER_FIELD);
  }

  get apptSubject() {
    return getFieldValue(this.serviceAppt?.data, APPTSUBJECT_FIELD);
  }

  get apptStatus() {
    return getFieldValue(this.serviceAppt?.data, APPTSTATUS_FIELD);
  }

  get apptStatusOptions() {
    return [
      { label: "Dispatched", value: "Dispatched" },
      { label: "In Progress", value: "In Progress" },
      { label: "Complete", value: "Complete" },
      { label: "Cannot Complete", value: "Cannot Complete" }
    ];
  }

  selectApptStatus(event) {
    this.apptStatusSelected = event.detail.value;
  }

  get apptParRecId() {
    return getFieldValue(this.serviceAppt?.data, APPTPARENTID_FIELD);
  }

  @wire(getRecord, {
    recordId: "$apptParRecId",
    fields: [WONUMBER_FIELD, WOWORKTYPEID_FIELD]
  })
  workOrder;

  get woNumber() {
    return getFieldValue(this.workOrder?.data, WONUMBER_FIELD);
  }

  editAppt() {
    this.showEdit = true;
  }

  saveAppt() {
    const fields = {};
    fields[APPTID_FIELD.fieldApiName] = this.recordId;
    fields[APPTSUBJECT_FIELD.fieldApiName] = this.template.querySelector(
      "[data-field='Subject']"
    ).value;
    if (this.apptStatusSelected) {
      fields[APPTSTATUS_FIELD.fieldApiName] = this.apptStatusSelected;
      this.apptStatusSelected = "";
    }
    const recordInput = { fields };
    updateRecord(recordInput).then(() => {
      this.showEdit = false;
      return refreshApex(this.serviceAppt);
    });
  }

  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "ServiceResources",
    fields: [
      "AssignedResource.Id",
      "AssignedResource.EstimatedTravelTime",
      "AssignedResource.ServiceResourceId",
      "AssignedResource.ServiceResourceName__c"
    ]
  })
  listInfo({ error, data }) {
    if (data) {
      this.assignedResources = data.records;
    }
  }
}
