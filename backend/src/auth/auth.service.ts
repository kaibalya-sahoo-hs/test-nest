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
            // Validation
            if (!name || !name.trim() || name.trim().length < 2) {
                return { message: "Name must be at least 2 characters", success: false }
            }
            if (!email || !email.trim()) {
                return { message: "Email is required", success: false }
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { message: "Invalid email format", success: false }
            }

            const trimmedName = name.trim();
            const trimmedEmail = email.trim().toLowerCase();

            console.log("Trigreed")
            const existingUser = await this.userRepo.findOneBy({ email: trimmedEmail })

            if (existingUser) {
                return { message: "User already exist", success: false }
            }
    
            const randomToken = uuidv4()
            console.log("Random Token", randomToken)
            const user = this.userRepo.create({ name: trimmedName, email: trimmedEmail, registartionToken: randomToken })
    
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
        // Validation
        if (!token || !token.trim()) {
            return { message: "Registration token is required", success: false }
        }
        // if (!password || password.length < 6) {
        //     return { message: "Password must be at least 6 characters", success: false }
        // }
        // if (!/(?=.*[a-z])/.test(password)) {
        //     return { message: "Password must contain at least one lowercase letter", success: false }
        // }
        // if (!/(?=.*[A-Z])/.test(password)) {
        //     return { message: "Password must contain at least one uppercase letter", success: false }
        // }
        // if (!/(?=.*\d)/.test(password)) {
        //     return { message: "Password must contain at least one number", success: false }
        // }
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
        // Validation
        if (!email || !email.trim()) {
            return { message: "Email is required", success: false }
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { message: "Invalid email format", success: false }
        }
        if (!password) {
            return { message: "Password is required", success: false }
        }

        const existingUser: User | null = await this.userRepo.findOneBy({ email: email.trim().toLowerCase() })
        if (!existingUser) {
            return { message: "User does not exist", success: false }
        }

        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
            return { message: "Wrong Password", success: false }
        }

        const payload = { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role };

        const accessToken = await this.JwtService.signAsync(payload, { expiresIn: '1h' });
        const refreshToken = await this.JwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: '1d' });

        return {
            message: "Login successful",
            user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, profile: existingUser.profile, role: existingUser.role, vendorStatus: existingUser.vendorStatus },
            accessToken,
            refreshToken,
            success: true
        }
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.JwtService.verifyAsync(refreshToken);

            console.log("Trigred ", payload)

            if (payload.type !== 'refresh') {
                return { message: "Invalid token type", success: false };
            }

            const user = await this.userRepo.findOneBy({ id: payload.user });
            if (!user) {
                return { message: "User not found", success: false };
            }

            const newPayload = { id: user.id, email: user.email, name: user.name, role: user.role};
            const newAccessToken = await this.JwtService.signAsync(newPayload, { expiresIn: '1h' });
            const newRefreshToken = await this.JwtService.signAsync({ ...newPayload, type: 'refresh' }, { expiresIn: '1d' });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                success: true
            };
        } catch (error) {
            return { message: "Invalid or expired refresh token", success: false };
        }
    }

}
