import toast from "react-hot-toast";

/** Copies a client UUID to the clipboard and shows a status toast. */
export async function copyClientId(clientId: string) {
  try {
    await navigator.clipboard.writeText(clientId);
    toast.success("Client ID copied");
  } catch {
    toast.error("Could not copy the client ID");
  }
}
