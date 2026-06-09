import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def get_key(password, salt):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    return key

def encrypt_data(data_bytes, password):
    salt = os.urandom(16)
    key = get_key(password, salt)
    iv = os.urandom(16)
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data_bytes) + padder.finalize()
    
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    # Prepend salt and iv for decryption
    result = salt + iv + ciphertext
    return base64.b64encode(result).decode('utf-8')

def decrypt_data(encrypted_b64, password):
    try:
        data = base64.b64decode(encrypted_b64)
        salt = data[:16]
        iv = data[16:32]
        ciphertext = data[32:]
        
        key = get_key(password, salt)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        
        padded_data = decryptor.update(ciphertext) + decryptor.finalize()
        
        unpadder = padding.PKCS7(128).unpadder()
        data_bytes = unpadder.update(padded_data) + unpadder.finalize()
        return data_bytes
    except Exception as e:
        raise ValueError("Invalid password or corrupted data.")
