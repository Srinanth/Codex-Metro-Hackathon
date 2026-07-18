export type FlexibleData = Record<string, unknown>;

export type CreateBusinessInput = {
  name: string;
  businessType: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  configuration?: FlexibleData;
  capabilities?: string[];
  rules?: string[];
};

export type UpdateBusinessInput = Partial<CreateBusinessInput>;
