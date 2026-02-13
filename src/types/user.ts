export interface User {
  id: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  email: string;
  phone: string;
}

export interface UserApiResponse {
  results: User[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}

export interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
}

export interface DummyJsonApiResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}
