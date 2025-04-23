import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ChatbotQueryDocument = ChatbotQuery & Document;

@Schema({ timestamps: true })
export class ChatbotQuery {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  response: any;

  @Prop()
  timestamp: Date;
}

export const ChatbotQuerySchema = SchemaFactory.createForClass(ChatbotQuery);
