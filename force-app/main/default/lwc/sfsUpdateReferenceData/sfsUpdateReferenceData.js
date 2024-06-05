import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import REFERENCEDATA_OBJECT from "@salesforce/schema/Reference_Data__c";
import REFERENCEDATAID_FIELD from "@salesforce/schema/Reference_Data__c.Id";
import REFERENCEDATANAME_FIELD from "@salesforce/schema/Reference_Data__c.Name";
import REFERENCEDATALONGTEXT_FIELD from "@salesforce/schema/Reference_Data__c.Long_Text__c";

export default class SfsLWCExamples extends NavigationMixin(LightningElement) {
  @api recordId;
  showEdit = false;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [
      REFERENCEDATAID_FIELD,
      REFERENCEDATANAME_FIELD,
      REFERENCEDATALONGTEXT_FIELD
    ]
  })
  referenceData;

  get referenceDataName() {
    return getFieldValue(this.referenceData?.data, REFERENCEDATANAME_FIELD);
  }

  get referenceDataLongText() {
    return getFieldValue(this.referenceData?.data, REFERENCEDATALONGTEXT_FIELD);
  }

  editReferenceData() {
    this.showEdit = true;
  }

  saveReferenceData() {
    const fields = {};
    fields[REFERENCEDATAID_FIELD.fieldApiName] = this.recordId;
    fields[REFERENCEDATANAME_FIELD.fieldApiName] = this.template.querySelector(
      "[data-field='Name']"
    ).value;
    fields[REFERENCEDATALONGTEXT_FIELD.fieldApiName] =
      this.template.querySelector("[data-field='Long_Text__c']").value;
    const recordInput = { fields };
    updateRecord(recordInput).then(() => {
      this.showEdit = false;
      return refreshApex(this.referenceData);
    });
  }
}
