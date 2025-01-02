import { IsInt, IsString } from "class-validator";


export class CloseChatDto{
    @IsInt()
    chatRoomId: number;
    @IsString()
    summary: string;
}
export class CloseChatDtoHttp{
    @IsString()
    summary: string;
}