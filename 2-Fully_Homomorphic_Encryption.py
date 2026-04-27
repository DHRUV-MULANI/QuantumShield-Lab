# ============================================================
# FULLY HOMOMORPHIC ENCRYPTION (FHE) - Simple Version
# ============================================================
# Homomorphic Encryption means:
#   You can do math on ENCRYPTED data WITHOUT decrypting it first!
#
# Example: Bank can compute your salary total without seeing
#          actual salary numbers.
#
# This is a simplified toy version to understand the concept.
# ============================================================

import random


# ============================================================
# HELPER: Find modular inverse
# ============================================================
# We need s_inv such that (s * s_inv) % mod == 1
def mod_inverse(a, mod):
    for x in range(1, mod):
        if (a * x) % mod == 1:
            return x
    return None  # If no inverse exists


# ============================================================
# KEY GENERATION
# ============================================================
def keygen():
    print("\n===== KEY GENERATION =====")
    s = int(input("Enter secret key s (a number): "))
    p = int(input("Enter modulus p (larger prime): "))
    q = int(input("Enter modulus q (small, e.g. 10): "))
    print(f"Secret key = {s}, p = {p}, q = {q}")
    return s, p, q


# ============================================================
# ENCRYPT A SINGLE DIGIT
# ============================================================
# Encryption formula: c = s * (r*q + m)
# r is a random number that hides the message
def encrypt(m, s, q):
    r = random.randint(1, 5)      # random noise to hide message
    c = s * (r * q + m)          # encrypt: wrap message with noise then multiply by s
    return c


# ============================================================
# DECRYPT A SINGLE DIGIT
# ============================================================
# Decryption formula:
#   Step 1: temp = (c * s_inverse) % p  --> removes the s factor
#   Step 2: result = temp % q           --> removes the noise
def decrypt(c, s, p, q):
    s_inv = mod_inverse(s, p)          # find modular inverse of s
    temp = (c * s_inv) % p             # step 1: remove s
    result = temp % q                  # step 2: remove noise, get original digit
    return result


# ============================================================
# ENCRYPT A FULL MESSAGE (list of digits)
# ============================================================
def encrypt_message(message, s, q):
    encrypted = []
    for digit in message:
        enc = encrypt(digit, s, q)
        encrypted.append(enc)
    return encrypted


# ============================================================
# DECRYPT A FULL MESSAGE (list of ciphertexts)
# ============================================================
def decrypt_message(cipher_list, s, p, q):
    decrypted = []
    for c in cipher_list:
        dec = decrypt(c, s, p, q)
        decrypted.append(dec)
    return decrypted


# ============================================================
# MAIN PROGRAM
# ============================================================

# Step 1: Get keys
s, p, q = keygen()

# Step 2: Get message from user (digits only)
msg = input("\nEnter message (digits only, e.g. 1234): ")

# Convert each character digit to integer
message = [int(d) for d in msg]
print("Original message digits:", message)

# Step 3: Encrypt each digit
cipher_list = encrypt_message(message, s, q)
print("\nEncrypted ciphertexts:", cipher_list)

# Step 4: Decrypt each ciphertext
decrypted = decrypt_message(cipher_list, s, p, q)
print("Decrypted digits:", decrypted)

# Step 5: Join digits back to string
print("Recovered message:", ''.join(map(str, decrypted)))

# ============================================================
# EXAMPLE INPUT:
# s = 3
# p = 71
# q = 10
# message = 1234
# ============================================================