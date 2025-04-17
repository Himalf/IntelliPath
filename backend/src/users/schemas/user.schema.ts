import { Prop, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  EXPERT = 'expert',
  SUPERADMIN = 'superAdmin',
  GUEST = 'guest',
}

export class User {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  fullName: string;
  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Prop()
  education?: string;
  @Prop()
  skills?: string; //comma seperated
  @Prop()
  resume_url?: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
