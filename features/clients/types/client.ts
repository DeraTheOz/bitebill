export type ClientAddress = {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export type ClientActivityFilter = "with" | "without";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  image: string | null;
  address: ClientAddress;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientListItem = Client & {
  invoiceCount: number;
};

export type ClientListPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
