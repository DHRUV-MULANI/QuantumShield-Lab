# ============================================================
# ELLIPTIC CURVE CRYPTOGRAPHY (ECC) - ElGamal Style
# ============================================================
# An elliptic curve is: y^2 = x^3 + ax + b  (mod p)
# 
# Points on this curve can be added together using special rules.
# This "point addition" is the hard math that makes ECC secure.
#
# ElGamal over Elliptic Curves:
#   - Alice has a private key (number d) and public key (point Q = d*G)
#   - To encrypt: use random k, send (C1=kG, C2=M+kQ)
#   - To decrypt: compute C2 - d*C1 = M
# ============================================================


# ============================================================
# STEP 1: Find modular inverse
# ============================================================
# We need this for the slope calculation in point addition
def mod_inv(a, p):
    return pow(a, -1, p)   # Python's built-in modular inverse


# ============================================================
# STEP 2: Add two points on the elliptic curve
# ============================================================
# Point "O" means the "point at infinity" (identity element, like zero in addition)
def point_add(P, Q, a, p):
    # If one point is infinity, return the other
    if P == "O":
        return Q
    if Q == "O":
        return P

    x1, y1 = P
    x2, y2 = Q

    # If points are opposite (same x, y = -y), result is point at infinity
    if x1 == x2 and (y1 + y2) % p == 0:
        return "O"

    # Calculate slope (m)
    if P != Q:
        # Different points: slope = (y2 - y1) / (x2 - x1)
        m = ((y2 - y1) * mod_inv(x2 - x1, p)) % p
    else:
        # Same point (point doubling): slope = (3x^2 + a) / (2y)
        m = ((3 * x1 * x1 + a) * mod_inv(2 * y1, p)) % p

    # Calculate new point coordinates
    x3 = (m * m - x1 - x2) % p
    y3 = (m * (x1 - x3) - y1) % p

    return (x3, y3)


# ============================================================
# STEP 3: Multiply a point by a scalar (number)
# ============================================================
# k * P means: add P to itself k times
# We use "double-and-add" method (fast, like binary exponentiation)
def scalar_mult(k, P, a, p):
    result = "O"    # Start with point at infinity (identity)
    temp = P        # Current point being doubled

    while k > 0:
        if k % 2 == 1:             # If current bit is 1
            result = point_add(result, temp, a, p)   # Add temp to result
        temp = point_add(temp, temp, a, p)           # Double temp
        k = k // 2                                   # Move to next bit

    return result


# ============================================================
# STEP 4: Check if a point is on the elliptic curve
# ============================================================
def is_on_curve(P, a, b, p):
    if P == "O":            # Point at infinity is always on curve
        return True
    x, y = P
    # Check: y^2 = x^3 + ax + b  (mod p)
    left_side  = y * y
    right_side = x * x * x + a * x + b
    return (left_side - right_side) % p == 0


# ============================================================
# MAIN PROGRAM
# ============================================================
if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("ELLIPTIC CURVE CRYPTOGRAPHY (ECC) - ElGamal")
    print("=" * 60)

    # ----- CURVE PARAMETERS -----
    print("\nEnter curve parameters (y^2 = x^3 + ax + b mod p):")
    p = int(input("Enter prime p: "))
    a = int(input("Enter a: "))
    b = int(input("Enter b: "))

    # ----- BASE POINT G -----
    print("\nEnter base/generator point G:")
    Gx = int(input("Gx: "))
    Gy = int(input("Gy: "))
    G = (Gx, Gy)

    # Verify G is actually on the curve
    if not is_on_curve(G, a, b, p):
        print("ERROR: G is not on the curve! Check your values.")
        exit()

    print(f"G = {G} is on the curve. Correct!")

    # ----- KEY GENERATION -----
    d = int(input("\nEnter private key d (a secret number): "))
    Q = scalar_mult(d, G, a, p)   # Public key = d * G

    print("\n========== KEY GENERATION ==========")
    print(f"Private key d = {d}")
    print(f"Public key Q = d*G = {Q}")

    # ----- MESSAGE POINT -----
    print("\nEnter message point M (must be on the curve):")
    Mx = int(input("Mx: "))
    My = int(input("My: "))
    M = (Mx, My)

    if not is_on_curve(M, a, b, p):
        print("ERROR: Message point M is not on the curve!")
        exit()

    # ----- RANDOM K (ENCRYPTION KEY) -----
    k = int(input("\nEnter random number k (for encryption): "))

    # ----- ENCRYPTION -----
    print("\n========== ENCRYPTION ==========")

    C1 = scalar_mult(k, G, a, p)
    print(f"Step 1: C1 = k*G = {C1}")

    kQ = scalar_mult(k, Q, a, p)
    print(f"Step 2: k*Q = {kQ}")

    C2 = point_add(M, kQ, a, p)
    print(f"Step 3: C2 = M + k*Q = {C2}")

    print(f"\nCiphertext = (C1, C2) = ({C1}, {C2})")

    # ----- DECRYPTION -----
    print("\n========== DECRYPTION ==========")

    # Compute d * C1
    dC1 = scalar_mult(d, C1, a, p)
    print(f"Step 1: d*C1 = {dC1}")

    # Negate the point (flip y coordinate)
    x, y = dC1
    neg_dC1 = (x, (-y) % p)
    print(f"Step 2: -d*C1 = {neg_dC1}")

    # Recover message: M = C2 - d*C1
    M_recovered = point_add(C2, neg_dC1, a, p)
    print(f"Step 3: M = C2 + (-d*C1) = {M_recovered}")

    # ----- VERIFICATION -----
    print("\n========== VERIFICATION ==========")
    print("Original M :", M)
    print("Recovered M:", M_recovered)

    if M == M_recovered:
        print("SUCCESS - Decryption worked!")
    else:
        print("FAILED - Something went wrong!")


# ============================================================
# EXAMPLE INPUT:
# p = 17, a = 2, b = 2
# G = (5, 1)
# d = 2 (private key)
# M = (6, 3) (message point)
# k = 3 (random)
# ============================================================