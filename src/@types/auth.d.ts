export interface ICreateUser{

    username: string
    email: string
    password: string
    role:String[],

}



export interface ITokenPayload{
    sub: int,
    username: string,
    role: string
}