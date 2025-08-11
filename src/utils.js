
/**
 * Utility function to append data to FormData.
 * @param {FormData} formData - The FormData object to append the data to.
 * @param {Object} dataObject - An object where each key-value pair is to be appended to the FormData.
 */
export function appendDataToFormData(formData, dataObject) {
  for (let key in dataObject) {
    if (dataObject.hasOwnProperty(key)) {
      formData.append(key, dataObject[key]);
    }
  }
}
