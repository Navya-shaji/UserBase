export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
}

export interface RandomUser {
  login: { uuid: string };
  name: { first: string; last: string };
  email: string;
  phone: string;
  picture: { large: string };
}

export interface RandomUserApiResponse {
  results: RandomUser[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}
