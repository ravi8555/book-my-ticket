import { createHmac, randomBytes } from "crypto";
export class PasswordUtills {
    
    static generateSalt(){
        return randomBytes(32).toString('hex')
    }
    static createSaltAndHashed(){
        const salt = this.generateSalt()
        const password = this.hashPassword(password, salt)
        return {salt, password}
    }
    static hashPassword(password, salt){
        return createHmac('sha256', salt)
               .update(password)
               .digest('hex')
    }
} 