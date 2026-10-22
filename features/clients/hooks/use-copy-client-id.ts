import toast from "react-hot-toast";

export async function copyClientId(clientId: string) {
  try {
    await navigator.clipboard.writeText(clientId);
    toast.success("Client ID copied");
  } catch {
    toast.error("Could not copy the client ID");
  }
}
