import { Field } from "./field";

export function AddressFields({ defaults }: { defaults?: string[] }) {
  return (
    <div className="space-y-6">
      <Field label="Street Address" value={defaults?.[0] ?? ""} />
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="City" value={defaults?.[1] ?? ""} />
        <Field label="Post Code" value={defaults?.[2] ?? ""} />
        <Field label="Country" value={defaults?.[3] ?? ""} />
      </div>
    </div>
  );
}
