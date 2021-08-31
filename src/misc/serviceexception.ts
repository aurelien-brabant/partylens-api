import {HttpStatus} from "@nestjs/common";

/**
 * Because throwing HTTP exceptions from a service is considered bad design,
 * partylens's services are expected to raise ServiceException-s instead. It
 * is then up to the service caller to catch these.
 * httpStatus is here to indicate the http status code that would fit the best to
 * the kind of error that occured, to make the life of the caller a little easier.
 */

export class ServiceException extends Error {
  httpStatus: HttpStatus = HttpStatus.NOT_IMPLEMENTED;

  constructor(message: string, httpStatus?: HttpStatus) {
    super(message);
    this.name = 'ServiceException'
    this.httpStatus = httpStatus;
  }
}
