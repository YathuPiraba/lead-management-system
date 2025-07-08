import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../user/entities/roles.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-uuid-user-id' })
  userId: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1627891234/profile/john_doe.png',
  })
  imageUrl: string;

  @ApiProperty({ example: 2 })
  roleId: number;

  @ApiProperty({ example: 'a1b2c3d4-uuid-org-id', nullable: true })
  orgId?: string;

  @ApiProperty({ enum: UserType, example: UserType.ORG_ADMIN })
  type: UserType;

  @ApiProperty({ example: true })
  isFirstLogin: boolean;
}
