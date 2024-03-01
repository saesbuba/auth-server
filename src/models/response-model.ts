export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
