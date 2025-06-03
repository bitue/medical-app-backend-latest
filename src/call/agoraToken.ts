import { Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

@Injectable()
export class AgoraService {
  private appId = '43581f14d406417885011f1130694c07';
  private appCertificate = '911a2fbb146148ccbd0c01ef8eefc170';

  generateRtcToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'publisher',
    expireSeconds = 3600,
  ): string {
    const roleEnum =
      role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTimestamp + expireSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      roleEnum,
      privilegeExpireTs,
    );
  }
}
