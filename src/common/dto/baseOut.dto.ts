// import { InfoCodes } from '../statusCodes';

export class BaseOutDto {
  status = true;

  // @ApiProperty({
  //   example: { code: 1 }
  // })
  // status: { code: number } = { code: InfoCodes.Success };
}

export const successResponseData = new BaseOutDto();

export interface Response<T> extends BaseOutDto {
  data: T;
}
// eslint-disable-next-line max-len
export const generateResponse = <T>(
  data: T,
  // ,code = 1
) => ({
  status: true,
  data,
});
