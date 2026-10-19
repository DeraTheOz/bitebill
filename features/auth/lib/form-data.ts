/**
 * Converts a plain object of field values into a `FormData` instance.
 * Values are stringified, so numbers and booleans are safe to pass.
 *
 * @param values - Field names mapped to their values.
 * @returns A `FormData` containing one entry per field.
 */
export function toFormData(values: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  return formData;
}
