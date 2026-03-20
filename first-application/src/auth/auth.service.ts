import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/member/member.entity';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
        private JwtService: JwtService,
        private mailService: MailService) { }


    async instializeRegistration({ name, email }) {
        try {
            console.log("Trigreed")
            const existingUser = await this.userRepo.findOneBy({ email })

            if (existingUser) {
                return { message: "User already exist", success: false }
            }
    
            const randomToken = uuidv4()
            console.log("Random Token", randomToken)
            const user = this.userRepo.create({ name, email, registartionToken: randomToken })
    
            const mailResposne = await this.mailService.sendMail(user.email, user.name, user.registartionToken)
            if(mailResposne.success){
                const savedUser =  await this.userRepo.save(user)
                console.log("Saved user - ", savedUser)
                return {message: "Email sent successfully", success: true}
            }else{
                return {message: "Error while sending the mail", success: false}
            }
        } catch (error) {
            console.log("Error while intializing registration", error)
            return {message: "Error while instailizing Resgistartion", success: false}
        }
    }


    async completeRegistartion({ token, password }) {
        const user = await this.userRepo.findOneBy({ registartionToken: token })
        console.log("User from registartionToken - ", user)
        if (!user) {
            return { message: "Invalid or expired token", success: false };
        }

        const hashedPass = await bcrypt.hash(password, 10);

        user.password = hashedPass;
        user.registartionToken = "";

        await this.userRepo.save(user);
        return { message: "Registration complete! You can now login.", success: true };
    }

    async loginUser({ email, password }) {
        const existingUser: User | null = await this.userRepo.findOneBy({ email })
        if (!existingUser) {
            return { message: "User doesnot exist", success: false }
        }

        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
            return { message: "Wrong Password", success: false }
        }
        const token = await this.JwtService.signAsync({ user: existingUser.id, email: existingUser.email, name: existingUser.name })

        return {
            mesage: "Login successful",
            user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, profile: existingUser.profile },
            token,
            success: true
        }

    }

}
