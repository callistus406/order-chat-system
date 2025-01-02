import { IsInt, IsString } from "class-validator";


export class SendMessage{
    @IsInt()
    chatRoomId: number;
    @IsInt()
    senderId: number;
    @IsString()
    content: string;
}