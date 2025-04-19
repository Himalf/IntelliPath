import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EXPERT = 'EXPERT',
  SUPERADMIN = 'SUPERADMIN',
  GUEST = 'GUEST',
}
export type UserDocument = User & Document;
@Schema()
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
