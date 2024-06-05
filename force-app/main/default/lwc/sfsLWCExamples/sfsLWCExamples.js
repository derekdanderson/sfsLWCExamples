import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import {
  getRecord,
  getFieldValue,
  updateRecord,
  createRecord
} from "lightning/uiRecordApi";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import { gql, graphql } from "lightning/uiGraphQLApi";
import APPTID_FIELD from "@salesforce/schema/ServiceAppointment.Id";
import APPTNUMBER_FIELD from "@salesforce/schema/ServiceAppointment.AppointmentNumber";
import APPTSUBJECT_FIELD from "@salesforce/schema/ServiceAppointment.Subject";
import APPTSTATUS_FIELD from "@salesforce/schema/ServiceAppointment.Status";
import APPTPARENTID_FIELD from "@salesforce/schema/ServiceAppointment.ParentRecordId";
import WONUMBER_FIELD from "@salesforce/schema/WorkOrder.WorkOrderNumber";
import WOWORKTYPEID_FIELD from "@salesforce/schema/WorkOrder.WorkTypeId";
import REFERENCEDATA_OBJECT from "@salesforce/schema/Reference_Data__c";
import REFERENCEDATANAME_FIELD from "@salesforce/schema/Reference_Data__c.Name";
import REFERENCEDATALONGTEXT_FIELD from "@salesforce/schema/Reference_Data__c.Long_Text__c";

export default class SfsLWCExamples extends NavigationMixin(LightningElement) {
  @api recordId;
  showEdit = false;
  apptStatusSelected = "";
  assignedResources;
  arResults;

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

  @wire(graphql, {
    query: gql`
      query AssignedResourceQuery($thisRecordId: ID) {
        uiapi {
          query {
            AssignedResource(
              where: { ServiceAppointmentId: { eq: $thisRecordId } }
            ) {
              edges {
                node {
                  Id
                  ServiceResourceId {
                    value
                  }
                  ServiceResourceName__c {
                    value
                  }
                  EstimatedTravelTime {
                    value
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: "$arQueryVars"
  })
  arQueryResults({ data, errors }) {
    if (data) {
      this.addOutput("arQueryResults " + JSON.stringify(data));
      this.arResults = data.uiapi.query.AssignedResource.edges.map(
        (edge) => edge.node
      );
    }
    if (errors) {
      this.handleError("arQueryResults errors", errors);
    }
  }
  get arQueryVars() {
    return {
      thisRecordId: this.recordId
    };
  }

  // Handle error
  handleError(func, errors) {
    this.addOutput("ERROR: " + func + " - " + JSON.stringify(errors));
  }

  addOutput(msg) {
    // Create timestamp
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const dateLocal = new Date(now.getTime() - offsetMs);
    const timestampStr = dateLocal.toISOString();
    console.log(`${timestampStr} - ${msg}`);
    this.output = `${timestampStr} - ${msg}\n\n${this.output}`;
  }

  newReferenceData() {
    const fields = {};
    fields[REFERENCEDATANAME_FIELD.fieldApiName] =
      "You just created this reference data";
    fields[REFERENCEDATALONGTEXT_FIELD.fieldApiName] =
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
    const recordInput = { apiName: REFERENCEDATA_OBJECT.objectApiName, fields };
    createRecord(recordInput).then((refData) => {
      this[NavigationMixin.Navigate]({
        type: "standard__webPage",
        attributes: {
          url: "com.salesforce.fieldservice://v1/sObject/" + refData.id
        }
      });
    });
  }
}

}
