import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'jjirihouepuepnewbereats';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    try {
      // GUI가 아닌 코드로 버켓 생성하는 방법
      // const upload = await new AWS.S3()
      //   .createBucket({
      //     Bucket: 'jjirihouepuepnewbereats', //아마존 전체계정에서 유일한 이름이어야하므로 특이해야함
      //   }) //버켓생성 확인 후 코드 지워주자
      //   .promise();

      const objectName = `${Date.now() + file.originalname}`;
      const upload = await new AWS.S3()
        .putObject({
          Body: file.buffer, //파일 내용임
          Bucket: BUCKET_NAME, // 죽을때까지 기억해야함 ㅎㅅㅎ
          Key: objectName, //파일 이름으로 설정 unique이름이 필요
          ACL: 'public-read', //권한 변경을 위한 옵션 기본적으로는 access denied가 됨
        })
        .promise();
      console.log(upload);

      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
