import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root',
})
export class CryptoService {
    private secretKey = 'arihantplus@123';

    encrypt(value: string): string {
        return CryptoJS.AES.encrypt(value, this.secretKey).toString();
    }

    decrypt(encryptedText: string): string {
        const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}
